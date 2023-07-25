'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { authValidate, getSelf } from '@/user/server'
import { validateRequest } from '@/request/validator'

import { nanoid } from 'nanoid'
import { BlogType, Role } from '@prisma/client'
import { noop, omit } from 'lodash-es'
import Boom from '@hapi/boom'
import { Type } from '@sinclair/typebox'

import type { Static } from '@sinclair/typebox'
import type { Prisma, User } from '@prisma/client'

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

async function filterBlogWithAuth<
  B extends {
    type: BlogType
    creator: Pick<User, 'id'>
  }
>(blog?: B | null) {
  if (!blog) {
    throw Boom.notFound('该博客不存在或已删除')
  }
  if (blog.type === BlogType.PUBLISHED) {
    return blog
  }
  const self = await getSelf()
  if (self.role === Role.ADMIN || blog.creator.id === self.id) {
    return blog
  }
  throw Boom.forbidden('你无权操作该博客')
}

async function filterBlogsWithAuth<
  B extends {
    type: BlogType
    creator: Pick<User, 'id'>
  }
>(blogs: (B | null | undefined)[]) {
  const self = await getSelf().catch(noop)
  return blogs.filter((b) => {
    if (!b) {
      return false
    }
    if (b.type === BlogType.PUBLISHED) {
      return true
    }
    return !!self && (self.role === Role.ADMIN || b.creator.id === self.id)
  }) as B[]
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

/**
 * withContent 需要 ADMIN 权限
 */
export const getBlogs = SA.encode(
  async (props: Prisma.BlogWhereInput, config?: { withContent?: boolean }) => {
    if (config?.withContent) {
      authValidate(await getSelf(), {
        roles: [Role.ADMIN],
      })
    }
    return prisma.blog
      .findMany({
        where: props,
        select: blogSelect,
        orderBy: [
          {
            creatorId: 'desc',
          },
          {
            updatedAt: 'desc',
          },
        ],
      })
      .then((blogs) => filterBlogsWithAuth(blogs))
      .then((blogs) =>
        blogs.map((blog) => ({
          ...blog,
          content: config?.withContent ? blog.content : '',
        }))
      )
  }
)

const saveBlogDto = Type.Object({
  /**
   * hash 为空则是新建
   */
  hash: Type.Optional(Type.String()),
  title: Type.String({
    minLength: 2,
    maxLength: 100,
  }),
  type: Type.Enum(BlogType),
  /**
   * Array<tag hash>
   */
  tags: Type.Array(Type.String()),
  description: Type.String({
    minLength: 2,
    maxLength: 200,
  }),
  content: Type.String({
    minLength: 2,
    maxLength: 20000,
  }),
})

export const saveBlog = SA.encode(async (props: Static<typeof saveBlogDto>) => {
  validateRequest(saveBlogDto, props)
  // 注册用户才能访问
  const self = await getSelf()
  const { hash, type, tags } = props
  // 移除标题的前后空格
  const title = props.title.trim()
  const description = props.description.trim()
  const content = props.content.trim()
  if (!hash) {
    // 所有人都能新建
    return prisma.blog.create({
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
})

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
          type: BlogType.PUBLISHED,
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
  if (!inputBlog || inputBlog.type !== BlogType.PUBLISHED) {
    // 博客不存在或者非公开, 直接返回最新的几篇
    // 非公开博客不能推荐(这样他人就能从推荐列表猜测博文内容了)
    return prisma.blog
      .findMany({
        where: {
          type: BlogType.PUBLISHED,
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
      type: BlogType.PUBLISHED,
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
      type: BlogType.PUBLISHED,
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
      type: BlogType.PUBLISHED,
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

  return filterBlogsWithAuth(
    // 这里可以忽略 non-null check, 因为后面 filter Boolean 了
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [nextBlog!, prevBlog!, ...similarBlogs].filter(Boolean)
  )
})
