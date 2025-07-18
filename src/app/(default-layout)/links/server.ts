'use server'

import { SA } from '@/errors/utils'
import { withRevalidate } from '@/errors/revalidate'
import { prisma } from '@/request/prisma'
import { emptyToUndefined, optionalString } from '@/request/utils'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { ensureUser } from '@/user/validate'
import {
  Role,
  FriendsLinkStatus,
  type Prisma,
  type FriendsLink,
} from '@/generated-prisma-client'

import Boom from '@hapi/boom'
import { noop } from 'lodash-es'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const linkSelect = {
  hash: true,
  status: true,
  name: true,
  email: true,
  url: true,
  image: true,
  description: true,
}

async function filterFriendsLinkWithAuth<
  T extends Pick<FriendsLink, 'status' | 'email'>,
>(link?: T | null) {
  if (!link) {
    throw Boom.notFound('该友链不存在或已删除')
  }
  const self = await getSelf()
  if (self.role === Role.ADMIN) {
    return link
  }
  if (link.status === 'ACCEPTED') {
    return {
      ...link,
      email: '',
    }
  }
  throw Boom.forbidden('你无权访问该友链')
}

async function filterFriendsLinksWithAuth<
  T extends Pick<FriendsLink, 'status' | 'email'>,
>(links: (T | null | undefined)[]) {
  const self = await getSelf().catch(noop)
  const nonEmptyLinks = links.filter((link) => !!link)
  if (self?.role === Role.ADMIN) {
    return nonEmptyLinks
  }
  return nonEmptyLinks
    .filter((link) => link.status === 'ACCEPTED')
    .map((link) => ({
      ...link,
      email: '',
    }))
}

export const getFriendsLink = SA.encode(
  async (props: Prisma.FriendsLinkWhereUniqueInput) =>
    prisma.friendsLink
      .findUnique({
        where: props,
        select: linkSelect,
      })
      .then(filterFriendsLinkWithAuth)
)

export type SimpleFriendsLink = NonNullable<
  Awaited<ReturnType<typeof getFriendsLink>>['data']
>

export const getFriendsLinks = SA.encode(
  async (props: Prisma.FriendsLinkWhereInput) =>
    prisma.friendsLink
      .findMany({
        where: props,
        select: linkSelect,
        orderBy: [
          {
            status: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
      })
      .then(filterFriendsLinksWithAuth)
)

const saveFriendsLinkDto = z.object({
  /**
   * hash 为空则是新建
   */
  hash: optionalString(z.string()),
  status: z.enum(FriendsLinkStatus).optional(),
  name: z.string().min(2).max(100),
  email: optionalString(z.email().max(200)),
  url: z.url().max(200),
  description: optionalString(z.string().max(200)),
  image: optionalString(z.url().max(400)),
})

export const saveFriendsLink = SA.encode(
  zf(saveFriendsLinkDto, async (props) => {
    const {
      hash,
      status = 'PENDING',
      name,
      email,
      url,
      description,
      image,
    } = emptyToUndefined(props, ['hash', 'description', 'email', 'image'])

    const user = await getSelf().catch(noop)

    if (user?.role !== Role.ADMIN && (status !== 'PENDING' || !!hash)) {
      throw Boom.forbidden('无权限')
    }
    if (!hash) {
      const newHash = nanoid(12)
      // 所有人都能新建
      return prisma.friendsLink
        .create({
          data: {
            hash: newHash,
            status,
            name,
            email,
            url,
            description,
            image,
          },
          select: linkSelect,
        })
        .then(
          withRevalidate({
            tags: ['getFriendsLinks'],
          })
        )
    }
    return prisma.friendsLink
      .update({
        where: {
          hash,
        },
        data: {
          status,
          name,
          email,
          url,
          description,
          image,
        },
        select: linkSelect,
      })
      .then(
        withRevalidate({
          tags: ['getFriendsLinks'],
        })
      )
  })
)

export const getFriendsLinkCounts = SA.encode(async () => {
  ensureUser(await getSelf(), { roles: ['ADMIN'] })
  return prisma.friendsLink.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  })
})
