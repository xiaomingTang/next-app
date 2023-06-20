'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'

import Boom from '@hapi/boom'

import type { Prisma } from '@prisma/client'

export const getBlog = SA.encode(async (props: Prisma.BlogWhereUniqueInput) =>
  prisma.blog.findUnique({
    where: props,
    select: {
      id: true,
      hash: true,
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
      id: true,
      hash: true,
      createdAt: true,
      updatedAt: true,
      title: true,
      tags: true,
      creator: true,
    },
  })
)

export const willThrowError = SA.encode(async () => {
  throw Boom.forbidden('你无权浏览')
})
