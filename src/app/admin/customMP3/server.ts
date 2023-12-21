'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { authValidate, getSelf } from '@/user/server'
import { validateRequest } from '@/request/validator'

import { nanoid } from 'nanoid'
import { Type } from '@sinclair/typebox'
import Boom from '@hapi/boom'

import type { Prisma } from '@prisma/client'
import type { Static } from '@sinclair/typebox'

const mp3Selector = {
  hash: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  mp3: true,
  lrc: true,
}

export const getMP3 = SA.encode(
  async (props: Prisma.CustomMP3WhereUniqueInput) => {
    const res = await prisma.customMP3.findUnique({
      where: props,
      select: mp3Selector,
    })
    if (!res) {
      throw Boom.notFound('mp3 不存在')
    }
    return res
  }
)

export const getMP3s = SA.encode(async (props: Prisma.CustomMP3WhereInput) =>
  prisma.customMP3.findMany({
    where: props,
    select: mp3Selector,
  })
)

const saveMP3Dto = Type.Object({
  hash: Type.Optional(
    Type.Union([
      Type.String({
        minLength: 6,
        maxLength: 50,
      }),
      Type.String({
        maxLength: 0,
      }),
    ])
  ),
  name: Type.String({
    minLength: 1,
  }),
  mp3: Type.String({
    format: 'uri',
  }),
  lrc: Type.Optional(
    Type.Union([
      Type.String({
        format: 'uri',
      }),
      Type.String({
        maxLength: 0,
      }),
    ])
  ),
})

export const saveMP3 = SA.encode(async (props: Static<typeof saveMP3Dto>) => {
  validateRequest(saveMP3Dto, props)
  const { hash = '', name, mp3, lrc = '' } = props
  await authValidate(await getSelf(), {
    roles: ['ADMIN'],
  })
  if (!hash) {
    return prisma.customMP3.create({
      data: {
        hash: nanoid(12),
        name,
        mp3,
        lrc,
      },
      select: mp3Selector,
    })
  }
  return prisma.customMP3.update({
    where: {
      hash,
    },
    data: {
      name,
      mp3,
      lrc,
    },
    select: mp3Selector,
  })
})

export const deleteMP3s = SA.encode(async (hashes: string[]) => {
  await authValidate(await getSelf(), {
    roles: ['ADMIN'],
  })
  const res = await prisma.customMP3.deleteMany({
    where: {
      hash: {
        in: hashes,
      },
    },
  })
  if (res.count === 0) {
    throw Boom.badRequest('待删除的 mp3 不存在')
  }
  return res
})
