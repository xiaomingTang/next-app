'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'
import { validateRequest } from '@/request/validator'

import { nanoid } from 'nanoid'
import { Type } from '@sinclair/typebox'
import { Role } from '@prisma/client'
import Boom from '@hapi/boom'

import type { Prisma } from '@prisma/client'
import type { Static } from '@sinclair/typebox'

const tagSelector = {
  hash: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
  creatorId: true,
  creator: true,
  _count: {
    select: {
      blogs: true,
    },
  },
}

export const getTag = SA.encode(async (props: Prisma.TagWhereUniqueInput) =>
  prisma.tag.findUnique({
    where: props,
    select: tagSelector,
  })
)

export const getTags = SA.encode(async (props: Prisma.TagWhereInput) =>
  prisma.tag.findMany({
    where: props,
    select: tagSelector,
  })
)

export type TagWithCreator = NonNullable<
  Awaited<ReturnType<typeof getTags>>['data']
>[number]

const saveTagDto = Type.Object({
  hash: Type.Union([
    Type.String({
      minLength: 6,
      maxLength: 16,
    }),
    Type.Optional(
      Type.String({
        maxLength: 0,
      })
    ),
  ]),
  name: Type.String({
    minLength: 2,
  }),
  description: Type.Union([
    Type.String({
      minLength: 2,
      maxLength: 66,
    }),
    Type.Optional(
      Type.String({
        maxLength: 0,
      })
    ),
  ]),
})

export const saveTag = SA.encode(async (props: Static<typeof saveTagDto>) => {
  validateRequest(saveTagDto, props)
  const { hash = '', name } = props
  const description = props.description || name
  const self = await getSelf()
  if (!hash) {
    return prisma.tag.create({
      data: {
        hash: nanoid(12),
        name,
        description,
        creatorId: self.id,
      },
      select: tagSelector,
    })
  }
  if (self.role !== Role.ADMIN) {
    // 非 admin 则需要请求者是作者
    await prisma.tag
      .findUnique({
        where: {
          hash,
        },
        select: tagSelector,
      })
      .then((res) => {
        if (!res) {
          throw Boom.notFound('标签不存在')
        }
        if (res.creatorId !== self.id) {
          throw Boom.forbidden('无权限')
        }
        return res
      })
  }
  return prisma.tag.update({
    where: {
      hash,
    },
    data: {
      name,
      description,
    },
    select: tagSelector,
  })
})

export const deleteTags = SA.encode(async (hashes: string[]) => {
  const self = await getSelf(true)
  let res: Prisma.BatchPayload
  if (self.role === Role.ADMIN) {
    // ADMIN 可以直接删除标签
    res = await prisma.tag.deleteMany({
      where: {
        hash: {
          in: hashes,
        },
      },
    })
    if (res.count === 0) {
      throw Boom.badRequest('待删除的标签不存在')
    }
  } else {
    // 否则, 只有作者才能删除对应标签
    res = await prisma.tag.deleteMany({
      where: {
        hash: {
          in: hashes,
        },
        creatorId: self.id,
      },
    })
    if (res.count === 0) {
      throw Boom.badRequest('待删除的标签不存在，或权限不足')
    }
  }
  return res
})
