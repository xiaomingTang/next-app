'use server'

import { SA } from '@/errors/utils'
import { withRevalidate } from '@/errors/revalidate'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'
import { zf } from '@/request/validator'
import blogFullTextSearchSql from '@/sql/blog-full-text-search.sql'
import { BlogType, Role } from '@/generated-prisma-client'

import { nanoid } from 'nanoid'
import { noop, omit } from 'lodash-es'
import Boom from '@hapi/boom'
import { z } from 'zod'

import type { Prisma, User } from '@/generated-prisma-client'

const blogSelect = {
  hash: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  title: true,
  content: true,
  description: true,
  tags: {
    select: {
      hash: true,
      name: true,
      description: true,
    },
  },
  creator: true,
}

function mosaicBlogUser<T extends { creator?: Partial<User> }>(blog: T): T {
  if (!blog.creator) {
    return blog
  }
  return {
    ...blog,
    creator: {
      ...blog.creator,
      password: blog.creator.password ? '' : undefined,
      email: blog.creator.email ? '' : undefined,
    },
  }
}

async function filterBlogWithAuth<
  B extends {
    type: BlogType
    creator: Pick<User, 'id'>
  },
>(blog?: B | null) {
  if (!blog) {
    throw Boom.notFound('该博客不存在或已删除')
  }
  if (blog.type === 'PUBLISHED') {
    return mosaicBlogUser(blog)
  }
  const self = await getSelf()
  if (self.role === Role.ADMIN || blog.creator.id === self.id) {
    return mosaicBlogUser(blog)
  }
  throw Boom.forbidden('你无权操作该博客')
}

async function filterBlogsWithAuth<
  B extends {
    type: BlogType
    creator: Pick<User, 'id'>
  },
>(blogs: (B | null | undefined)[]) {
  const self = await getSelf().catch(noop)
  const filteredBlogs = blogs
    .filter((b) => !!b)
    .filter((b) => {
      if (b.type === 'PUBLISHED') {
        return true
      }
      return !!self && (self.role === Role.ADMIN || b.creator.id === self.id)
    })
  return filteredBlogs.map((item) => mosaicBlogUser(item))
}

export const getBlog = SA.encode(async (props: Prisma.BlogWhereUniqueInput) =>
  prisma.blog
    .findUnique({
      where: props,
      select: blogSelect,
    })
    .then(filterBlogWithAuth)
)

export type BlogWithTags = NonNullable<
  Awaited<ReturnType<typeof getBlog>>['data']
>

export const getBlogs = SA.encode(async (props: Prisma.BlogWhereInput) =>
  prisma.blog
    .findMany({
      where: props,
      select: {
        ...blogSelect,
        content: false,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    })
    .then((blogs) => filterBlogsWithAuth(blogs))
    .then((blogs) =>
      blogs.map((blog) => ({
        ...blog,
        content: '',
      }))
    )
)

/**
 * 用于**无需权限**批量获取带 content 的 blogs
 * @deprecated ⚠️⚠️⚠️ 该方法仅供后台内部调用，前台不可调用 ⚠️⚠️⚠️
 */
export const privateGetBlogs = SA.encode(async (props: Prisma.BlogWhereInput) =>
  prisma.blog
    .findMany({
      where: props,
      select: blogSelect,
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    })
    .then((blogs) => blogs.map(mosaicBlogUser))
)

const saveBlogDto = z.object({
  /**
   * hash 为空则是新建
   */
  hash: z.string().optional(),
  title: z.string().min(2).max(100),
  type: z.enum(BlogType),
  /**
   * Array<tag hash>
   */
  tags: z.array(z.string()),
  description: z.string().min(2).max(200),
  content: z.string().min(2).max(20000),
})

export const saveBlog = SA.encode(
  zf(saveBlogDto, async (props) => {
    // 注册用户才能访问
    const self = await getSelf()
    const { hash, type, tags } = props
    // 移除标题的前后空格
    const title = props.title.trim()
    const description = props.description.trim()
    const content = props.content.trim()
    if (!hash) {
      // 所有人都能新建
      return prisma.blog
        .create({
          data: {
            hash: nanoid(12),
            content,
            description,
            title,
            type,
            tags: {
              connect: tags.map((tagHash) => ({
                hash: tagHash,
              })),
            },
            creatorId: self.id,
          },
          select: blogSelect,
        })
        .then(mosaicBlogUser)
        .then(
          withRevalidate({
            tags: ['getBlogs'],
          })
        )
    }
    // 以下是保存
    if (self.role !== Role.ADMIN) {
      // 非 admin 则需要请求者是作者
      await prisma.blog
        .findUnique({
          where: {
            hash,
          },
          select: blogSelect,
        })
        .then(filterBlogWithAuth)
    }
    return prisma.blog
      .update({
        where: {
          hash,
        },
        data: {
          content,
          description,
          title,
          type,
          tags: {
            set: tags.map((tagHash) => ({
              hash: tagHash,
            })),
          },
        },
        select: blogSelect,
      })
      .then(filterBlogWithAuth)
      .then(
        withRevalidate({
          tags: [`getBlog:${props.hash}`, 'getBlogs'],
        })
      )
  })
)

export const deleteBlogs = SA.encode(async (blogHashes: string[]) => {
  const self = await getSelf()
  if (self.role === Role.ADMIN) {
    // ADMIN 可以直接删除博文
    return prisma.blog.deleteMany({
      where: {
        hash: {
          in: blogHashes,
        },
      },
    })
  }
  // 否则, 只有作者才能删除对应博文
  return prisma.blog.deleteMany({
    where: {
      hash: {
        in: blogHashes,
      },
      creatorId: self.id,
    },
  })
})

function getPrefix(sentence: string) {
  // 取前三分之二(最少 4 个字)
  return sentence.slice(0, Math.max(4, sentence.length * 0.666))
}

export const getRecommendBlogs = SA.encode(async (hash: string) => {
  if (!hash || typeof hash !== 'string') {
    // 非法请求, 直接返回最新的几篇
    return prisma.blog
      .findMany({
        where: {
          type: 'PUBLISHED',
        },
        take: 3,
        orderBy: {
          updatedAt: 'desc',
        },
        select: blogSelect,
      })
      .then(filterBlogsWithAuth)
  }
  const inputBlog = await prisma.blog.findUnique({
    where: {
      hash,
    },
    select: omit(blogSelect, 'content'),
  })
  if (!inputBlog || inputBlog.type !== 'PUBLISHED') {
    // 博客不存在或者非公开, 直接返回最新的几篇
    // 非公开博客不能推荐(这样他人就能从推荐列表猜测博文内容了)
    return prisma.blog
      .findMany({
        where: {
          type: 'PUBLISHED',
        },
        take: 3,
        orderBy: {
          updatedAt: 'desc',
        },
        select: blogSelect,
      })
      .then(filterBlogsWithAuth)
  }
  const { title, createdAt } = inputBlog
  const tags = inputBlog.tags.map((t) => t.hash)
  const selectedBlogHashes = [hash]
  // 取标题相似的、发布时间在该博客前、且是最晚的
  // 认为其为系列文章的前一篇
  const prevBlog = await prisma.blog.findFirst({
    where: {
      type: 'PUBLISHED',
      title: {
        startsWith: getPrefix(title),
      },
      hash: {
        notIn: selectedBlogHashes,
      },
      createdAt: {
        lt: createdAt,
      },
    },
    select: blogSelect,
    orderBy: [
      {
        updatedAt: 'desc',
      },
    ],
  })
  if (prevBlog) {
    selectedBlogHashes.push(prevBlog.hash)
  }
  // 取标题相似的、发布时间在该博客后、且是最早的
  // 认为其为系列文章的后一篇
  const nextBlog = await prisma.blog.findFirst({
    where: {
      type: 'PUBLISHED',
      title: {
        startsWith: getPrefix(title),
      },
      hash: {
        notIn: selectedBlogHashes,
      },
      createdAt: {
        gt: createdAt,
      },
    },
    select: blogSelect,
    orderBy: [
      {
        updatedAt: 'asc',
      },
    ],
  })
  if (nextBlog) {
    selectedBlogHashes.push(nextBlog.hash)
  }
  // 取含相同标签的、最近更新的, 作为相似博客
  const similarBlogs = await prisma.blog.findMany({
    take: 4 - selectedBlogHashes.length,
    where: {
      type: 'PUBLISHED',
      hash: {
        notIn: selectedBlogHashes,
      },
      tags: {
        some: {
          hash: {
            in: tags,
          },
        },
      },
    },
    select: blogSelect,
    orderBy: [
      {
        updatedAt: 'desc',
      },
    ],
  })

  return filterBlogsWithAuth([nextBlog, prevBlog, ...similarBlogs])
})

const searchBlogDto = z.object({
  s: z.string().min(2).max(50),
})

export const searchBlog = SA.encode(
  zf(searchBlogDto, async (props) => {
    const { s } = props
    return prisma
      .$queryRawUnsafe<BlogWithTags[]>(blogFullTextSearchSql, s)
      .then(filterBlogsWithAuth)
  })
)
