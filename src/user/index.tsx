'use client'

import { LoginModal } from './LoginModal'

import { withStatic } from '@/utils/withStatic'
import { sleepMs } from '@/utils/time'

import NiceModal from '@ebay/nice-modal-react'
import { Role } from '@prisma/client'
import { create } from 'zustand'

import type { User } from '@prisma/client'

const defaultUser: Required<User> = {
  id: 0,
  name: '',
  role: Role.USER,
  password: '',
  email: '',
}

const USER_STORAGE_KEY = 'user'

const useRawUser = create(() => defaultUser)

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
      ...u,
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
   * - new Error('用户取消登录')
   */
  async login(): Promise<User> {
    const user = useUser.getUser()
    if (user.id > 0) {
      useUser.updateUser({})
      return user
    }
    return new Promise((resolve, reject) => {
      NiceModal.show(LoginModal, {
        onSuccess(u) {
          useUser.updateUser(u)
          resolve(u)
        },
        onCancel() {
          reject(new Error('用户取消登录'))
        },
      })
    })
  },
  async logout() {
    await sleepMs(1500)
    throw new Error('暂时不允许退出登录')
    localStorage.removeItem(USER_STORAGE_KEY)
    useRawUser.setState(defaultUser)
  },
})
