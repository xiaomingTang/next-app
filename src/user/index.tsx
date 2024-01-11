'use client'

import { LoginModal } from './LoginModal'
import { logout } from './server'

import { withStatic } from '@/utils/withStatic'
import { SA } from '@/errors/utils'

import NiceModal from '@ebay/nice-modal-react'
import { create } from 'zustand'
import { useEffect } from 'react'
import { isEqual } from 'lodash-es'

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
      return {
        ...defaultUser,
        ...JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? ''),
      } as Required<User>
    } catch (error) {
      return defaultUser
    }
  },
  updateUser(u: Partial<User>) {
    const newUser = {
      ...useUser.getUser(),
      ...u,
    }
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
    // 同一个 user 避免状态更新
    const REPLACE_FLAG = true
    useUser.setState((prev) => {
      if (isEqual(prev, newUser)) {
        return prev
      }
      return newUser
    }, REPLACE_FLAG)
  },
  reset() {
    useUser.updateUser(defaultUser)
  },
  useInit() {
    useEffect(() => {
      useUser.updateUser({})
    }, [])
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
    const memoedUser = useUser.getState()
    if (memoedUser.id > 0) {
      return memoedUser
    }
    const user = useUser.getUser()
    if (user.id > 0) {
      useUser.updateUser({})
      return user
    }
    promise = new Promise((resolve, reject) => {
      NiceModal.show<User, NiceModalHocProps, {}>(LoginModal)
        .then((u) => {
          promise = null
          useUser.updateUser(u)
          resolve(u)
        })
        .catch((err) => {
          promise = null
          useUser.reset()
          reject(err)
        })
    })
    return promise
  },
  async logout() {
    await logout().then(SA.decode)
    useUser.reset()
  },
})
