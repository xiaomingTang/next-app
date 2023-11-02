'use client'

import { LoginModal } from './LoginModal'
import { logout } from './server'

import { withStatic } from '@/utils/withStatic'
import { SA } from '@/errors/utils'

import NiceModal from '@ebay/nice-modal-react'
import { create } from 'zustand'

import type { NiceModalHocProps } from '@ebay/nice-modal-react'
import type { User } from '@prisma/client'

const defaultUser: Required<User> = {
  id: 0,
  name: '',
  role: 'USER',
  password: '',
  email: '',
}

const USER_STORAGE_KEY = 'user'

const useRawUser = create(() => defaultUser)

let promise: Promise<User> | null = null

export const useUser = withStatic(useRawUser, {
  getUser() {
    try {
      return JSON.parse(
        localStorage.getItem(USER_STORAGE_KEY) ?? ''
      ) as Required<User>
    } catch (error) {
      return defaultUser
    }
  },
  updateUser(u: Partial<User>) {
    const newUser = {
      ...defaultUser,
      ...useUser.getUser(),
      ...u,
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    useRawUser.setState(newUser)
  },
  reset() {
    const newUser = {
      ...defaultUser,
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    useRawUser.setState(newUser)
  },
  init() {
    useRawUser.setState(useUser.getUser())
  },
  /**
   * @WARNING !!!
   * 该方法会抛错:
   * - new Error('操作已取消')
   */
  async login(): Promise<User> {
    if (promise) {
      return promise
    }
    const user = useUser.getUser()
    if (user.id > 0) {
      useUser.updateUser({})
      return user
    }
    promise = new Promise((resolve, reject) => {
      NiceModal.show<User, NiceModalHocProps, {}>(LoginModal)
        .then((u) => {
          useUser.updateUser(u)
          promise = null
          resolve(u)
        })
        .catch((err) => {
          promise = null
          useRawUser.setState(defaultUser)
          reject(err)
        })
    })
    return promise
  },
  async logout() {
    await logout().then(SA.decode)
    localStorage.removeItem(USER_STORAGE_KEY)
    useRawUser.setState(defaultUser)
  },
})
