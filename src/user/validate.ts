import 'server-only'

import Boom from '@hapi/boom'

import type { User, Role } from '@/generated-prisma-client'

type AuthValidateProps = {
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
  strict?: boolean
}

export function ensureUser(
  user: Pick<User, 'role' | 'id'>,
  { roles = ['USER'], userIds = [] }: AuthValidateProps
) {
  if (!user.id) {
    throw Boom.unauthorized('用户未登录')
  }
  if (
    user.role === 'ADMIN' ||
    roles.includes(user.role) ||
    userIds.includes(user.id)
  ) {
    return
  }
  throw Boom.forbidden('权限不足')
}
