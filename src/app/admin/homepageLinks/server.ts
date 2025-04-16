'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { optionalString } from '@/request/utils'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { ensureUser } from '@/user/validate'

import Boom from '@hapi/boom'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const linksSelector = {
  hash: true,
  enabled: true,
  name: true,
  url: true,
  description: true,
  updatedAt: true,
  createdAt: true,
  creator: {
    select: {
      id: true,
      name: true,
    },
  },
}

export const getEnabledHomepageLinks = SA.encode(async () => {
  const res = await prisma.homepageLinks.findMany({
    where: {
      enabled: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: linksSelector,
  })
  return res
})

export const getAllHomepageLinks = SA.encode(async () => {
  await getSelf()
  const res = await prisma.homepageLinks.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: linksSelector,
  })
  return res
})

const saveHomepageLinkDto = z.object({
  hash: optionalString(z.string().min(6).max(50)),
  name: z.string().min(1),
  url: z.string().url(),
  description: optionalString(z.string().max(2000)),
  image: optionalString(z.string().url()),
  enabled: z.boolean().optional(),
})

export const saveHomepageLink = SA.encode(
  zf(saveHomepageLinkDto, async (props) => {
    const { hash, name, url, description = '', image = '', enabled } = props
    const user = await getSelf()
    ensureUser(user, {
      roles: ['ADMIN'],
    })
    if (!hash) {
      return prisma.homepageLinks.create({
        data: {
          hash: nanoid(12),
          name,
          url,
          description,
          image,
          enabled,
          creatorId: user.id,
        },
        select: linksSelector,
      })
    }
    return prisma.homepageLinks.update({
      where: {
        hash,
      },
      data: {
        name,
        url,
        description,
        image,
        enabled: enabled ?? false,
        creatorId: user.id,
      },
      select: linksSelector,
    })
  })
)

export const deleteHomepageLinks = SA.encode(async (hashes: string[]) => {
  ensureUser(await getSelf(), {
    roles: ['ADMIN'],
  })
  const res = await prisma.homepageLinks.deleteMany({
    where: {
      hash: {
        in: hashes,
      },
    },
  })
  if (res.count === 0) {
    throw Boom.badRequest('待删除的 首页链接 不存在')
  }
  return res
})
