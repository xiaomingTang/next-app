'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { authValidate, getSelf } from '@/user/server'
import { validateRequest } from '@/request/validator'
import { generatePassword } from '@/utils/password'

import Boom from '@hapi/boom'
import { Role } from '@prisma/client'
import { Type } from '@sinclair/typebox'
import { noop } from 'lodash-es'

import type { Static } from '@sinclair/typebox'
import type { Prisma } from '@prisma/client'

function mosaic<T extends Record<string, unknown>>(
  obj: T,
  replacement: Partial<T>
): T {
  return {
    ...obj,
    ...replacement,
  }
}

function mosaicPassword<T extends { password: string }>(u: T): T {
  return mosaic(u, {
    password: '',
  } as Partial<T>)
}

export const getUser = SA.encode(async (props: Prisma.UserWhereUniqueInput) => {
  const user = await prisma.user.findUnique({
    where: props,
  })
  if (!user) {
    throw Boom.notFound('该用户不存在')
  }
  const self = await getSelf().catch(noop)
  if (self?.role === Role.ADMIN || self?.id === user.id) {
    return mosaic(user, {
      password: '',
    })
  }
  // 非 admin 或 非本人 看不到其他人的邮箱
  return mosaic(user, {
    password: '',
    email: '',
  })
})

export const getUsers = SA.encode(async (props: Prisma.UserWhereInput) => {
  await authValidate(await getSelf(), {
    roles: [Role.ADMIN],
  })

  const users = await prisma.user.findMany({
    where: props,
  })
  return users.map(mosaicPassword)
})

const saveDto = Type.Object({
  /**
   * id 为空即为创建
   */
  id: Type.Optional(Type.Number()),
  email: Type.String({
    format: 'email',
  }),
  password: Type.Optional(
    Type.Union([
      Type.String({
        minLength: 6,
        maxLength: 16,
      }),
      Type.String({
        maxLength: 0,
      }),
    ])
  ),
  name: Type.String({
    minLength: 3,
    maxLength: 24,
  }),
  role: Type.Enum(Role),
})

export const saveUser = SA.encode(async (props: Static<typeof saveDto>) => {
  validateRequest(saveDto, props)
  await authValidate(await getSelf(), {
    roles: [Role.ADMIN],
  })
  const { id, email, name, role, password } = props
  const encodedPassword = !password ? undefined : generatePassword(password)
  if (!id) {
    if (!encodedPassword) {
      throw Boom.badRequest('创建用户时，密码为必填项')
    }
    return prisma.user
      .create({
        data: {
          email,
          name,
          role,
          password: encodedPassword,
        },
      })
      .then(mosaicPassword)
  }
  return prisma.user
    .update({
      where: {
        id,
      },
      data: {
        email,
        name,
        role,
        password: encodedPassword,
      },
    })
    .then(mosaicPassword)
})

export const deleteUsers = SA.encode(async (ids: number[]) => {
  await authValidate(await getSelf(), {
    roles: [Role.ADMIN],
  })
  return prisma.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
      // admin 不通过请求删除, 要删去数据库删吧
      role: Role.USER,
    },
  })
})
