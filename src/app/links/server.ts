'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { validateRequest } from '@/request/validator'
import { getSelf } from '@/user/server'
import { geneDingtalkUrl, sendToDingTalk } from '@/push/dingtalk/utils'
import { resolvePath } from '@/utils/url'

import Boom from '@hapi/boom'
import {
  Role,
  FriendsLinkStatus,
  type Prisma,
  type FriendsLink,
} from '@prisma/client'
import { Type } from '@sinclair/typebox'
import { noop } from 'lodash-es'
import { nanoid } from 'nanoid'

import type { Static } from '@sinclair/typebox'

const linkSelect = {
  hash: true,
  status: true,
  name: true,
  url: true,
  image: true,
  description: true,
}

async function filterFriendsLinkWithAuth<T extends Pick<FriendsLink, 'status'>>(
  link?: T | null
) {
  if (!link) {
    throw Boom.notFound('该友链不存在或已删除')
  }
  const self = await getSelf()
  if (self.role === Role.ADMIN || link.status === 'ACCEPTED') {
    return link
  }
  throw Boom.forbidden('你无权访问该友链')
}

async function filterFriendsLinksWithAuth<
  T extends Pick<FriendsLink, 'status'>,
>(links: (T | null | undefined)[]) {
  const self = await getSelf().catch(noop)
  return links.filter((link) => {
    if (!link) {
      return false
    }
    return self?.role === Role.ADMIN || link.status === 'ACCEPTED'
  }) as T[]
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

const saveFriendsLinkDto = Type.Object({
  /**
   * hash 为空则是新建
   */
  hash: Type.Optional(Type.String()),
  status: Type.Optional(Type.Enum(FriendsLinkStatus)),
  name: Type.Optional(
    Type.String({
      maxLength: 100,
    })
  ),
  email: Type.Optional(
    Type.String({
      format: 'email',
      maxLength: 200,
    })
  ),
  url: Type.String({
    minLength: 1,
    maxLength: 200,
    pattern: `https?:\\/\\/`,
  }),
  description: Type.Optional(
    Type.String({
      maxLength: 200,
    })
  ),
  image: Type.Optional(
    Type.String({
      maxLength: 400,
      pattern: `https?:\\/\\/`,
    })
  ),
})

export const saveFriendsLink = SA.encode(
  async (props: Static<typeof saveFriendsLinkDto>) => {
    const {
      hash,
      status = 'PENDING',
      name,
      email,
      url,
      description,
      image,
    } = validateRequest(saveFriendsLinkDto, props)

    const user = await getSelf().catch(noop)

    if (user?.role !== Role.ADMIN && (status !== 'PENDING' || !!hash)) {
      throw Boom.forbidden('无权限')
    }
    if (!hash) {
      if (status === 'PENDING') {
        sendToDingTalk({
          msgtype: 'markdown',
          at: {},
          markdown: {
            title: '你有新的友链申请',
            text: `
# 友链申请   

站点名称:  ${name}   

站点描述:  ${description || '无'}   

站点 url:  [${url}](${url})   

站点 logo: ${!image ? '无' : `![${image}](${image})`}   

[查看详情](${geneDingtalkUrl(resolvePath(`/links/${hash}`).href, true).href})   
            `,
          },
        })
      }
      // 所有人都能新建
      return prisma.friendsLink.create({
        data: {
          hash: nanoid(12),
          status,
          name,
          email,
          url,
          description,
          image,
        },
        select: linkSelect,
      })
    }
    return prisma.friendsLink.update({
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
  }
)
