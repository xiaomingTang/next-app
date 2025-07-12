'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { optionalString } from '@/request/utils'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { ensureUser } from '@/user/validate'

import { nanoid } from 'nanoid'
import { z } from 'zod'

const saveCommentDto = z.object({
  name: optionalString(z.string().max(100)),
  email: optionalString(z.email().max(200)),
  content: z.string().min(2).max(10000),
})

export const saveComment = SA.encode(
  zf(saveCommentDto, async (props) => {
    const { name, email, content } = props
    return prisma.comment.create({
      data: {
        hash: nanoid(12),
        name: name || undefined,
        email: email || undefined,
        content,
      },
    })
  })
)

export const getComments = SA.encode(async () => {
  ensureUser(await getSelf(), { roles: ['ADMIN'] })
  return prisma.comment.findMany()
})
