'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { authValidate, getSelf } from '@/user/server'

import { nanoid } from 'nanoid'
import { BlogType, Role } from '@prisma/client'
import { noop, pick } from 'lodash-es'
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
    })
    .then((blogs) => filterBlogsWithAuth(blogs))
)

export const saveBlog = SA.encode(
  async (
    hash: string,
    props: Pick<Prisma.BlogUpdateInput, 'content' | 'title' | 'tags' | 'type'>
  ) => {
    const self = await getSelf()
    if (self.role === Role.ADMIN) {
      return prisma.blog
        .update({
          where: {
            hash,
          },
          data: {
            ...pick(props, 'content', 'title', 'tags', 'type'),
            updatedAt: new Date(),
          },
          select: blogSelect,
        })
        .then(filterBlogWithAuth)
    }
    const { count } = await prisma.blog.updateMany({
      where: {
        AND: {
          hash,
          creatorId: self.id,
        },
      },
      data: {
        ...pick(props, 'content', 'title', 'tags', 'type'),
        updatedAt: new Date(),
      },
    })
    if (count > 0) {
      return prisma.blog
        .findUnique({
          where: {
            hash,
          },
          select: blogSelect,
        })
        .then(filterBlogWithAuth)
    }
    throw Boom.notFound('文章不存在或权限不足')
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

export const createNewBlog = SA.encode(async () => {
  const self = await getSelf()
  await authValidate(self, {
    roles: [Role.ADMIN],
  })
  return prisma.blog.create({
    data: {
      hash: nanoid(12),
      content: '',
      title: '',
      creatorId: self.id,
      type: BlogType.PRIVATE_UNPUBLISHED,
    },
    select: blogSelect,
  })
})
