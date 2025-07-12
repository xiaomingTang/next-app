'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'
import { zf } from '@/request/validator'
import { comparePassword, generatePassword } from '@/utils/password'
import { Role } from '@/generated-prisma-client'

import Boom from '@hapi/boom'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import type { Prisma } from '@/generated-prisma-client'

function mosaic<T extends Record<string, unknown>>(
  obj: T,
  replacement: Partial<T>
): T {
  return {
    ...obj,
    ...replacement,
  }
}

function mosaicPassword<T extends { password?: string | null }>(u: T): T {
  return mosaic(u, {
    password: '',
  } as Partial<T>)
}

export const getShortUrl = SA.encode(
  async (props: Prisma.ShortUrlWhereUniqueInput, password?: string) => {
    const res = await prisma.shortUrl.findUnique({
      where: props,
    })

    if (!res) {
      throw Boom.notFound('该短链不存在或已不可用')
    }
    if (res.password) {
      if (!password) {
        throw Boom.preconditionRequired('访问需要密码')
      }
      if (!comparePassword(password ?? '', res.password)) {
        throw Boom.preconditionRequired('密码不正确')
      }
    }

    await prisma.shortUrl.update({
      where: {
        hash: res.hash,
      },
      data: {
        limit: {
          decrement: 1,
        },
      },
    })

    return mosaicPassword(res)
  }
)

const urlSelect = {
  createdAt: true,
  updatedAt: true,
  creatorId: true,
  creator: true,
  hash: true,
  url: true,
  description: true,
  timeout: true,
  limit: true,
  password: true,
}

export const getShortUrls = SA.encode(
  async (props: Prisma.ShortUrlWhereInput) => {
    const self = await getSelf()

    const urls = await prisma.shortUrl
      .findMany({
        where: {
          ...props,
        },
        select: urlSelect,
        orderBy: {
          createdAt: 'desc',
        },
      })
      .then((res) =>
        res.map((item) => ({
          ...mosaicPassword(item),
          encrypt: !!item.password,
        }))
      )

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

const saveDto = z.object({
  hash: z.string().optional(),
  description: z.string(),
  password: z.string(),
  limit: z.number(),
  // jsonschema 包不支持 Date 类型的校验
  timeout: z.number(),
  url: z.url(),
})

export const saveShortUrl = SA.encode(
  zf(saveDto, async (props) => {
    const { hash, limit, url, description } = props
    const password = generatePassword(props.password)
    const timeout = new Date(props.timeout)
    const encodedUrl = encodeURI(url)
    const self = await getSelf()
    if (!hash) {
      // 所有用户都能新建
      return prisma.shortUrl.create({
        data: {
          hash: nanoid(12),
          url: encodedUrl,
          description,
          creatorId: self.id,
          password,
          limit,
          timeout,
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
        description,
        password,
        limit,
        timeout,
      },
      select: urlSelect,
    })
  })
)

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
