'use client'

import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { Role } from '@prisma/client'
import router from 'next/router'
import { isEqual, pick } from 'lodash-es'

import type { User } from '@prisma/client'

const defaultUser: Required<User> = {
  id: 0,
  name: '',
  role: Role.USER,
  password: '',
  email: '',
}

const useRawUser = create<SimpleUser>(() => defaultUser)

export const useUser = withStatic(useRawUser, {
  logout: async () => {
    await fetch('/api/auth/logout', {
      method: 'post',
    }).then(() => {
      useUser.setUser(null)
    })
  },
  routeToLogin: () => {
    const redirectUrl = new URL('/auth/login', window.location.href)
    redirectUrl.searchParams.set('redirect', window.location.href)
    if (redirectUrl.pathname === window.location.pathname) {
      return
    }
    router.replace(redirectUrl)
  },
  setUser: (user: SimpleUser | null) => {
    // 保证设置进 store / localStorage 的是且仅是 Required<User>
    // (必须保证, 否则会有循环更新的 bug)
    const finalUser: Required<User> = pick(
      {
        ...defaultUser,
        ...(user ?? defaultUser),
      },
      ['id', 'name', 'role', 'password', 'email']
    )
    useRawUser.setState(finalUser)
    localStorage.setItem('USER', JSON.stringify(finalUser))
  },
  /**
   * This hook is used to initialize the user store with the user data;
   * WONT clear, but only set the user data if it is NOT EMPTY;
   * @warn 待测试 当更新用户时的行为(场景暂无)
   */
  useInitializeUser: (user?: User | null) => {
    const newUser =
      user ?? JSON.parse(localStorage.getItem('USER') ?? '') ?? defaultUser
    const oldUser = useUser.getState()
    // 必须比较, 否则会导致循环更新
    if (!isEqual(newUser, oldUser)) {
      useUser.setUser(newUser)
    }
  },
})
