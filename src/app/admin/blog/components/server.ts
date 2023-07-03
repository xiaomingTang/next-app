'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'

import { nanoid } from 'nanoid'
import { BlogType, Role } from '@prisma/client'
import { noop } from 'lodash-es'
import Boom from '@hapi/boom'

import type { Prisma, User } from '@prisma/client'

const blogSelect = {
  hash: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  title: true,
  content: true,
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
    throw Boom.notFound('该博客不存在')
  }
  if (blog.type === BlogType.PUBLIC_PUBLISHED) {
    return blog
  }
  const self = await getSelf()
  if (self.role === Role.ADMIN || blog.creator.id === self.id) {
    return blog
  }
  throw Boom.forbidden('你无权浏览该博客')
}

async function filterBlogsWithAuth<
  B extends {
    type: BlogType
    creator: Pick<User, 'id'>
  }
>(blogs: B[]) {
  const res: B[] = []
  for (let i = 0; i < blogs.length; i += 1) {
    filterBlogWithAuth(blogs[i])
      .then((b) => {
        res.push(b)
      })
      .catch(noop)
  }
  return res
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
      select: blogSelect,
      // TODO: orderBy not working
      orderBy: {
        updatedAt: 'desc',
      },
    })
    .then((blogs) => filterBlogsWithAuth(blogs))
)

export const saveBlog = SA.encode(
  async ({
    hash,
    content,
    title,
    type,
    tags,
  }: {
    /**
     * hash 为空则是新建
     */
    hash?: string
    title: string
    content: string
    type: BlogType
    /**
     * Array<tag hash>
     */
    tags: string[]
  }) => {
    // 注册用户才能访问
    const self = await getSelf()
    if (!hash) {
      // 所有人都能新建
      return prisma.blog.create({
        data: {
          hash: nanoid(12),
          content,
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
          title,
          type,
          tags: {
            connect: tags.map((tagHash) => ({
              hash: tagHash,
            })),
          },
        },
        select: blogSelect,
      })
      .then(filterBlogWithAuth)
  }
)

export const deleteBlogs = SA.encode(async (blogHashes: string[]) => {
  const self = await getSelf(true)
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

export const getTag = SA.encode(async (props: Prisma.TagWhereUniqueInput) =>
  prisma.tag.findUnique({
    where: props,
    select: {
      hash: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      creator: true,
      _count: {
        select: {
          blogs: true,
        },
      },
    },
  })
)

export const getTags = SA.encode(async (props: Prisma.TagWhereInput) =>
  prisma.tag.findMany({
    where: props,
    select: {
      hash: true,
      name: true,
      description: true,
      _count: {
        select: {
          blogs: true,
        },
      },
    },
  })
)
