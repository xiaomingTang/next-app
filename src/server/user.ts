'use server'

import { SA } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { generatePassword } from '@/utils/password'

import Boom from '@hapi/boom'

import type { User } from '@prisma/client'

export const createUser = SA.encode(async (userId: User['id']) => {
  console.log(userId)
})

export const updateUser = SA.encode(async (userId: User['id']) => {
  console.log(userId)
})

export const deleteUser = SA.encode(async (userId: User['id']) => {
  console.log(userId)
})

interface LoginProps {
  email: string
  password: string
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
    return {
      ...user,
      password: '',
    }
  }
)
