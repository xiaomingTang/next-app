'use server'

import { imageWithSize } from '../upload/utils/imageWithSize'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { validateRequest } from '@/request/validator'
import { authValidate, getSelf } from '@/user/server'

import Boom from '@hapi/boom'
import { Type } from '@sinclair/typebox'
import { nanoid } from 'nanoid'
import { MediaCardType, Role } from '@prisma/client'

import type { Prisma, User } from '@prisma/client'
import type { Static } from '@sinclair/typebox'

const mediaCardSelect = {
  hash: true,
  order: true,
  createdAt: true,
  updatedAt: true,
  type: true,
  title: true,
  description: true,
  image: true,
  audio: true,
  video: true,
  creatorId: true,
  creator: true,
}

async function filterMediaCardWithAuth<
  B extends {
    creator: Pick<User, 'id'>
  }
>(card?: B | null) {
  if (!card) {
    throw Boom.notFound('该卡片不存在或已删除')
  }
  const self = await getSelf()
  if (self.role === Role.ADMIN || card.creator.id === self.id) {
    return card
  }
  throw Boom.forbidden('你无权操作该卡片')
}

const saveMediaCardDto = Type.Object({
  /**
   * hash 为空则是新建
   */
  hash: Type.Optional(Type.String()),
  title: Type.String({
    minLength: 2,
    maxLength: 100,
  }),
  type: Type.Enum(MediaCardType),
  description: Type.Optional(
    Type.String({
      maxLength: 200,
    })
  ),
  order: Type.Optional(
    Type.Number({
      minimum: 0,
      maximum: 1000,
    })
  ),
  image: Type.Optional(
    Type.String({
      maxLength: 500,
    })
  ),
  audio: Type.Optional(
    Type.String({
      maxLength: 500,
    })
  ),
  video: Type.Optional(
    Type.String({
      maxLength: 500,
    })
  ),
})

export const saveMediaCard = SA.encode(
  async (props: Static<typeof saveMediaCardDto>) => {
    validateRequest(saveMediaCardDto, props)
    // 注册用户才能访问
    const self = await getSelf()
    const { hash, type } = props
    // 移除标题的前后空格
    const title = props.title.trim()
    const description = (props.description ?? '').trim()
    const order = props.order ?? 0
    const image = (props.image ?? '').trim()
    const audio = (props.audio ?? '').trim()
    const video = (props.video ?? '').trim()
    if (!hash) {
      // 所有人都能新建
      return prisma.mediaCard.create({
        data: {
          hash: nanoid(12),
          creatorId: self.id,
          title,
          description,
          order,
          type,
          image: image ? (await imageWithSize({ url: image })).href : '',
          audio,
          video,
        },
        select: mediaCardSelect,
      })
    }

    // 以下是保存
    if (self.role !== Role.ADMIN) {
      // 非 admin 则需要请求者是作者
      await prisma.mediaCard
        .findUnique({
          where: {
            hash,
          },
          select: mediaCardSelect,
        })
        .then(filterMediaCardWithAuth)
    }
    return prisma.mediaCard
      .update({
        where: {
          hash,
        },
        data: {
          title,
          description,
          type,
          order,
          image: image ? (await imageWithSize({ url: image })).href : '',
          audio,
          video,
        },
        select: mediaCardSelect,
      })
      .then(filterMediaCardWithAuth)
  }
)

export type MediaCardWithUser = NonNullable<
  Awaited<ReturnType<typeof saveMediaCard>>['data']
>

export const getMediaCards = SA.encode(
  async (props: Prisma.MediaCardWhereInput) =>
    prisma.mediaCard.findMany({
      where: props,
      select: mediaCardSelect,
      orderBy: [
        {
          order: 'asc',
        },
        {
          updatedAt: 'desc',
        },
      ],
    })
)

const sortMediaCardsDto = Type.Array(
  Type.Object({
    hash: Type.String(),
    order: Type.Number({
      minimum: 0,
      maximum: 1000,
    }),
  })
)

export const sortMediaCards = SA.encode(
  async (props: Static<typeof sortMediaCardsDto>) => {
    await authValidate(await getSelf(), {
      roles: ['ADMIN'],
    })
    return prisma.mediaCard.updateMany({
      data: props,
    })
  }
)
