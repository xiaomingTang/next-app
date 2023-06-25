'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'

import { BlogType } from '@prisma/client'

import type { Prisma } from '@prisma/client'

export const getBlog = SA.encode(async (props: Prisma.BlogWhereUniqueInput) =>
  prisma.blog.findUnique({
    where: props,
    select: {
      hash: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      title: true,
      content: true,
      tags: true,
      creator: true,
    },
  })
)

export const getBlogs = SA.encode(async (props: Prisma.BlogWhereInput) =>
  prisma.blog.findMany({
    where: props,
    select: {
      hash: true,
      type: true,
      createdAt: true,
      updatedAt: true,
      title: true,
      tags: true,
      creator: true,
    },
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
  })
})
