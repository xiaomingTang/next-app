'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf } from '@/user/server'
import { ensureUser } from '@/user/validate'
import { zf } from '@/request/validator'
import { emptyToUndefined, optionalString } from '@/request/utils'

import { nanoid } from 'nanoid'
import Boom from '@hapi/boom'
import { z } from 'zod'

import type { Prisma } from '@/generated-prisma-client'

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

const saveMP3Dto = z.object({
  hash: optionalString(z.string().min(6).max(50)),
  name: z.string().min(1),
  mp3: z.string().url(),
  lrc: optionalString(z.string().url()),
})

export const saveMP3 = SA.encode(
  zf(saveMP3Dto, async (props) => {
    const { hash, name, mp3, lrc } = emptyToUndefined(props, ['hash', 'lrc'])
    ensureUser(await getSelf(), {
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
)

export const deleteMP3s = SA.encode(async (hashes: string[]) => {
  ensureUser(await getSelf(), {
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
