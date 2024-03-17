'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { validateRequest } from '@/request/validator'
import { sendToDingTalk } from '@/push/dingtalk/utils'
import { authValidate, getSelf } from '@/user/server'

import { Type } from '@sinclair/typebox'
import { nanoid } from 'nanoid'

import type { Static } from '@sinclair/typebox'

const saveCommentDto = Type.Object({
  name: Type.Optional(
    Type.Union([
      Type.String({
        maxLength: 0,
      }),
      Type.String({
        maxLength: 100,
      }),
    ])
  ),
  email: Type.Optional(
    Type.Union([
      Type.String({
        maxLength: 0,
      }),
      Type.String({
        maxLength: 200,
        format: 'email',
      }),
    ])
  ),
  content: Type.String({
    minLength: 2,
    maxLength: 10000,
  }),
})

export const saveComment = SA.encode(
  async (props: Static<typeof saveCommentDto>) => {
    const { name, email, content } = validateRequest(saveCommentDto, props)
    void sendToDingTalk({
      msgtype: 'text',
      at: {},
      text: {
        content: `你有新的用户留言:
  - 用户名: ${name || '无'}
  - 邮箱: ${email || '无'}
  - 内容:
${content}`,
      },
    })
    return prisma.comment.create({
      data: {
        hash: nanoid(12),
        name,
        email,
        content,
      },
    })
  }
)

export const getComments = SA.encode(async () => {
  await authValidate(await getSelf(), { roles: ['ADMIN'] })
  return prisma.comment.findMany()
})
