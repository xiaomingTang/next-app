'use server'

import { SA } from '@/errors/utils'

import { Role } from '@prisma/client'

import type { User } from '@prisma/client'

export const createUser = SA.encode(async (userId: User['id']) => {
  console.log(userId)
})

export const readUser = SA.encode(async (userId: User['id']) => {
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
    console.log({
      email,
      password,
    })
    return {
      email,
      password: '',
      id: 11,
      name: 'name-11',
      role: Role.ADMIN,
    }
  }
)
