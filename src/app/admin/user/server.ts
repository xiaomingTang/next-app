'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { getSelf, setCookieAsUser } from '@/user/server'
import { ensureUser } from '@/user/validate'
import { zf } from '@/request/validator'
import { generatePassword } from '@/utils/password'
import { emptyToUndefined, optionalString } from '@/request/utils'
import { Role } from '@/generated-prisma-client'

import Boom from '@hapi/boom'
import { noop } from 'lodash-es'
import { nanoid } from 'nanoid'
import { z } from 'zod'

import type { Prisma } from '@/generated-prisma-client'

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
  ensureUser(await getSelf(), {
    roles: [Role.ADMIN],
  })

  const users = await prisma.user.findMany({
    where: props,
  })
  return users.map(mosaicPassword)
})

const saveDto = z.object({
  /**
   * id 为空即为创建
   */
  id: z.number().optional(),
  email: z.email(),
  password: optionalString(z.string().min(6).max(16)),
  name: z.string().min(3).max(24),
  role: z.enum(Role),
})

export const saveUser = SA.encode(
  zf(saveDto, async (props) => {
    ensureUser(await getSelf(), {
      roles: [Role.ADMIN],
    })
    const { id, email, name, role, password } = emptyToUndefined(props, [
      'password',
    ])
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
)

export const deleteUsers = SA.encode(async (ids: number[]) => {
  ensureUser(await getSelf(), {
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
