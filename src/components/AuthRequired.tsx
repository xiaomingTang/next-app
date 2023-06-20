'use client'

import { useUser } from '@/user'

import { NoSsr } from '@mui/material'
import { Role } from '@prisma/client'
import { noop } from 'lodash-es'
import { useEffect } from 'react'

import type { User } from '@prisma/client'

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
}

const defaultRoles = [Role.USER]
const defaultUserIds: User['id'][] = []
const defaultFallback = <></>

export function AuthRequired({
  disabled = false,
  roles = defaultRoles,
  userIds = defaultUserIds,
  fallback = defaultFallback,
  children,
}: AuthRequiredProps) {
  const user = useUser()

  useEffect(() => {
    if (!disabled && !user.id) {
      useUser.login().catch(noop)
    }
  }, [disabled, user.id])

  const getChildren = () => {
    if (disabled) {
      return children
    }

    if (!user.id) {
      return fallback
    }

    if (
      user.role === Role.ADMIN ||
      roles.includes(user.role) ||
      userIds.includes(user.id)
    ) {
      return children
    }
    return fallback
  }

  return <NoSsr>{getChildren()}</NoSsr>
}
