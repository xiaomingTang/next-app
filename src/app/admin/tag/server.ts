'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'
import { zf } from '@/request/validator'
import { emptyToUndefined, optionalString } from '@/request/utils'
import { BlogType, Role } from '@/generated-prisma-client'

import { nanoid } from 'nanoid'
import Boom from '@hapi/boom'
import { z } from 'zod'

import type { Prisma } from '@/generated-prisma-client'

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
      blogs: {
        where: {
          type: BlogType.PUBLISHED,
        },
      },
    },
  },
}

export const getTag = SA.encode(async (props: Prisma.TagWhereUniqueInput) => {
  const res = await prisma.tag.findUnique({
    where: props,
    select: tagSelector,
  })
  if (!res) {
    throw Boom.notFound('标签不存在')
  }
  return res
})

export const getTags = SA.encode(async (props: Prisma.TagWhereInput) =>
  prisma.tag.findMany({
    where: props,
    select: tagSelector,
    orderBy: [
      {
        blogs: {
          _count: 'desc',
        },
      },
    ],
  })
)

export type TagWithCreator = NonNullable<
  Awaited<ReturnType<typeof getTags>>['data']
>[number]

const saveTagDto = z.object({
  hash: optionalString(z.string().min(6).max(16)),
  name: z.string().min(2),
  description: optionalString(z.string().min(2).max(66)),
})

export const saveTag = SA.encode(
  zf(saveTagDto, async (props) => {
    const { hash, name } = emptyToUndefined(props, ['hash', 'description'])
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
)

export const deleteTags = SA.encode(async (hashes: string[]) => {
  const self = await getSelf()
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
