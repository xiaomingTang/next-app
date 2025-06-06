'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { generatePassword } from '@/utils/password'

import jwt from 'jsonwebtoken'
import { cookies, headers } from 'next/headers'
import Boom from '@hapi/boom'
import { omit } from 'lodash-es'

import type { PickAndPartial } from '@/utils/type'
import type { User } from '@/generated-prisma-client'

interface LoginProps {
  email: string
  password: string
}

const EXPIRE_DURATION = 60 * 60 * 24 * 3
const authorizationKey = 'Authorization'

export async function setCookieAsUser(
  user: PickAndPartial<User, 'email' | 'password'>
) {
  const token = jwt.sign(
    omit(user, 'email', 'password'),
    process.env.JWT_SECRET,
    {
      expiresIn: EXPIRE_DURATION,
    }
  )

  const proto = (await headers()).get('origin') ?? ''

  ;(await cookies()).set({
    name: authorizationKey,
    value: token,
    httpOnly: true,
    // 保证前端失效后，后端再失效
    // 同时能避免服务端和客户端时间差导致的 bug
    maxAge: EXPIRE_DURATION - 60,
    secure: proto.startsWith('https') || proto.startsWith('http://localhost'),
    sameSite: 'lax',
    path: '/',
  })
}

export const login = SA.encode(
  async ({ email, password }: LoginProps): Promise<User> => {
    const user = await prisma.user.findFirst({
      where: {
        email,
        password: generatePassword(password),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
    if (!user) {
      throw Boom.unauthorized('账号或密码不正确')
    }

    await setCookieAsUser(user)

    return {
      ...user,
      password: '',
    }
  }
)

export const logout = SA.encode(async () => {
  ;(await cookies()).delete(authorizationKey)
})

/**
 * @warning 未登录调用该方法时, 默认抛 401,
 * 如有必要, 需要手动 catch
 * @param strict 为 true 时会去查验数据库
 */
export async function getSelf(strict = false) {
  const token =
    (await cookies()).get(authorizationKey)?.value ||
    (await headers()).get(authorizationKey) ||
    ''
  if (!token) {
    throw Boom.unauthorized('用户未登录')
  }
  try {
    let user = jwt.verify(token, process.env.JWT_SECRET) as Omit<
      User,
      'password' | 'email'
    >
    if (strict) {
      user = await prisma.user.findUniqueOrThrow({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          name: true,
          role: true,
        },
      })
    }
    return user
  } catch (error) {
    console.error(error)
    throw Boom.unauthorized('该用户不存在')
  }
}
