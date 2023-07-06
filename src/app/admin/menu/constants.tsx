import { MenuTree } from './MenuTree'

import {
  PersonOutline,
  FeedOutlined,
  SellOutlined,
  LinkOutlined,
} from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import { Role } from '@prisma/client'

import type { NestedMenu } from './MenuTree'

/**
 * admin routes
 */
export const menuList: NestedMenu[] = [
  {
    name: '用户管理',
    roles: [Role.ADMIN],
    path: '/admin/user',
    icon: <PersonOutline />,
  },
  {
    name: '博客管理',
    path: '/admin/blog',
    icon: <FeedOutlined />,
  },
  {
    name: '标签管理',
    path: '/admin/tag',
    icon: <SellOutlined />,
  },
  {
    name: '短链管理',
    path: '/admin/shortUrl',
    icon: <LinkOutlined />,
  },
]

/**
 * admin routes tree
 */
export const menuTree = new MenuTree({
  name: 'ROOT',
  children: menuList,
})

/**
 * ONLY can be used in admin routes
 * @returns MenuTree instance
 */
export function useActiveMenu() {
  const pathname = usePathname()
  return useMemo(
    () =>
      menuTree.findChild((item) => {
        if (item.path === pathname) {
          return item
        }
        return undefined
      }),
    [pathname]
  )
}
