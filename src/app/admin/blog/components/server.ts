'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'

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
