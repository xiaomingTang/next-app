'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { authValidate, getSelf, setCookieAsUser } from '@/user/server'
import { validateRequest } from '@/request/validator'
import { generatePassword } from '@/utils/password'

import Boom from '@hapi/boom'
import { Role } from '@prisma/client'
import { Type } from '@sinclair/typebox'
import { noop } from 'lodash-es'
import { nanoid } from 'nanoid'

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

/**
 * TODO: 下面几个方法都需要限流
 */
export const requestQrcodeToken = SA.encode(async (prevToken?: string) => {
  if (prevToken) {
    await prisma.qrcodeLoginToken
      .delete({
        where: {
          token: prevToken,
        },
      })
      .catch(noop)
  }
  return prisma.qrcodeLoginToken.create({
    data: {
      token: nanoid(18),
    },
  })
})

export const disableQrcodeToken = SA.encode(async (token: string) => {
  await prisma.qrcodeLoginToken
    .delete({
      where: {
        token,
      },
    })
    .catch(noop)
})

export const confirmQrcodeLogin = SA.encode(async (token: string) => {
  // 注册用户才能访问
  const self = await getSelf()
  const now = new Date(Date.now())
  const before = new Date(now)
  before.setSeconds(now.getSeconds() - 90)
  return prisma.qrcodeLoginToken
    .update({
      where: {
        token,
        createdAt: {
          gt: before,
          lt: now,
        },
      },
      data: {
        userId: self.id,
      },
    })
    .then(noop)
    .catch(() => {
      throw Boom.badRequest('二维码已失效，请重新扫码')
    })
})

export const requestQrcodeLogin = SA.encode(async (token: string) => {
  const now = new Date(Date.now())
  const before = new Date(now)
  before.setSeconds(now.getSeconds() - 10)
  const tokenInfo = await prisma.qrcodeLoginToken.findUnique({
    where: {
      token,
      userId: {
        gt: 0,
      },
      updatedAt: {
        gt: before,
        lt: now,
      },
    },
  })
  const userId = tokenInfo?.userId
  if (!userId) {
    throw Boom.badRequest('请扫码授权登录')
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (!user) {
    throw Boom.badRequest('用户不存在')
  }
  await setCookieAsUser(user)
  return mosaic(user, {
    password: '',
  })
})
