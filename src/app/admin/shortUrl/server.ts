'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'
import { validateRequest } from '@/request/validator'

import Boom from '@hapi/boom'
import { Role } from '@prisma/client'
import { nanoid } from 'nanoid'
import { Type } from '@sinclair/typebox'

import type { Static } from '@sinclair/typebox'
import type { Prisma } from '@prisma/client'

export const getShortUrl = SA.encode(
  async (props: Prisma.ShortUrlWhereUniqueInput) =>
    prisma.shortUrl
      .findUnique({
        where: props,
      })
      .then((res) => {
        if (!res) {
          throw Boom.notFound('该短链不存在')
        }
        return res
      })
)

const urlSelect = {
  createdAt: true,
  updatedAt: true,
  creatorId: true,
  creator: true,
  hash: true,
  url: true,
}

export const getShortUrls = SA.encode(
  async (props: Prisma.ShortUrlWhereInput) => {
    const self = await getSelf()

    const urls = await prisma.shortUrl.findMany({
      where: {
        ...props,
      },
      select: urlSelect,
      orderBy: {
        updatedAt: 'desc',
      },
    })

    if (self.role === Role.ADMIN) {
      return urls
    }

    // 非 admin 用户只能查看自己创建的 url
    return urls.filter((url) => url.creatorId === self.id)
  }
)

export type ShortUrlWithCreator = NonNullable<
  Awaited<ReturnType<typeof getShortUrls>>['data']
>[number]

const saveDto = Type.Object({
  hash: Type.Optional(Type.String()),
  url: Type.String({
    format: 'uri',
  }),
})

export const saveShortUrl = SA.encode(async (props: Static<typeof saveDto>) => {
  validateRequest(saveDto, props)
  const { hash, url } = props
  const encodedUrl = encodeURI(url)
  const self = await getSelf()
  if (!hash) {
    // 所有用户都能新建
    return prisma.shortUrl.create({
      data: {
        hash: nanoid(12),
        url: encodedUrl,
        creatorId: self.id,
      },
      select: urlSelect,
    })
  }
  if (self.role !== Role.ADMIN) {
    // 非 admin 则需要请求者是作者
    await prisma.shortUrl
      .findUnique({
        where: {
          hash,
        },
        select: urlSelect,
      })
      .then((res) => {
        if (!res) {
          throw Boom.notFound('短链不存在')
        }
        if (res.creatorId !== self.id) {
          throw Boom.forbidden('无权限')
        }
        return res
      })
  }
  return prisma.shortUrl.update({
    where: {
      hash,
    },
    data: {
      url: encodedUrl,
    },
    select: urlSelect,
  })
})

export const deleteShortUrls = SA.encode(async (hashes: string[]) => {
  const self = await getSelf()
  if (self.role === Role.ADMIN) {
    // ADMIN 可以直接删除短链
    return prisma.shortUrl.deleteMany({
      where: {
        hash: {
          in: hashes,
        },
      },
    })
  }
  // 否则, 只有作者才能删除对应短链
  return prisma.shortUrl.deleteMany({
    where: {
      hash: {
        in: hashes,
      },
      creatorId: self.id,
    },
  })
})
