'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'

import { BlogType } from '@prisma/client'
import { pick } from 'lodash-es'

import type { Prisma } from '@prisma/client'

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

export const getBlog = SA.encode(async (props: Prisma.BlogWhereUniqueInput) =>
  prisma.blog.findUnique({
    where: props,
    select: blogSelect,
  })
)

export const getBlogs = SA.encode(async (props: Prisma.BlogWhereInput) =>
  prisma.blog.findMany({
    where: props,
    select: blogSelect,
  })
)

export const saveBlog = SA.encode(
  async (
    hash: string,
    props: Pick<Prisma.BlogUpdateInput, 'content' | 'title' | 'tags' | 'type'>
  ) =>
    prisma.blog.update({
      where: {
        hash,
      },
      data: {
        ...pick(props, 'content', 'title', 'tags', 'type'),
        updatedAt: new Date(),
      },
      select: blogSelect,
    })
)

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
  const hash = `${self.id}_DRAFT`
  return prisma.blog.upsert({
    where: {
      hash,
    },
    create: {
      hash,
      content: '',
      title: '',
      creatorId: self.id,
      type: BlogType.PRIVATE_UNPUBLISHED,
    },
    update: {},
    select: blogSelect,
  })
})
