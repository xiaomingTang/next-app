'use client'

import { useUser } from '@/user'

import { noop } from 'lodash-es'
import { useEffect } from 'react'
import { NoSsr } from '@mui/material'

import type { Role, User } from '@/generated-prisma-client'

type AuthRequiredProps = {
  disabled?: boolean
  children?: React.ReactNode | React.ReactNode[]
  /**
   * roles 之间、与 userIds 之间, 均为 或 关系;
   * 即: 只要满足任一条件即可;
   */
  roles?: Role[]
  /**
   * roles 之间、与 userIds 之间, 均为 或 关系;
   * 即: 只要满足任一条件即可;
   */
  userIds?: User['id'][]
  fallback?: React.ReactNode | React.ReactNode[]
  /**
   * 为 false 则会在未登录时自动弹出登录框
   * @default false
   */
  silence?: boolean
}

const defaultRoles: Role[] = ['USER']
const defaultUserIds: User['id'][] = []
const defaultFallback = <></>

function RawAuthRequired({
  silence = false,
  disabled = false,
  roles = defaultRoles,
  userIds = defaultUserIds,
  fallback = defaultFallback,
  children,
}: AuthRequiredProps) {
  const user = useUser()

  useEffect(() => {
    if (!disabled && !user.id && !silence) {
      useUser.login().catch(noop)
    }
  }, [disabled, user.id, silence])

  if (disabled) {
    return children
  }

  if (!user.id) {
    return fallback
  }

  if (
    user.role === 'ADMIN' ||
    roles.includes(user.role) ||
    userIds.includes(user.id)
  ) {
    return children
  }
  return fallback
}

export function AuthRequired(props: AuthRequiredProps) {
  return (
    <NoSsr>
      <RawAuthRequired {...props} />
    </NoSsr>
  )
}
