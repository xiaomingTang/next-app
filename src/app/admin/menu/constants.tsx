import { MenuTree } from './MenuTree'

import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import FeedIcon from '@mui/icons-material/Feed'
import SellIcon from '@mui/icons-material/Sell'
import LinkIcon from '@mui/icons-material/Link'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import MessageIcon from '@mui/icons-material/Message'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import type { NestedMenu } from './MenuTree'

/**
 * admin routes
 */
export const menuList: NestedMenu[] = [
  {
    name: '用户管理',
    roles: ['ADMIN'],
    path: '/admin/user',
    icon: <PersonOutlineIcon />,
  },
  {
    name: '博客管理',
    path: '/admin/blog',
    icon: <FeedIcon />,
  },
  {
    name: '标签管理',
    path: '/admin/tag',
    icon: <SellIcon />,
  },
  {
    name: '留言管理',
    roles: ['ADMIN'],
    path: '/admin/comment',
    icon: <MessageIcon />,
  },
  {
    name: '短链管理',
    path: '/admin/shortUrl',
    icon: <LinkIcon />,
  },
  {
    name: '歌曲管理',
    roles: ['ADMIN'],
    path: '/admin/customMP3',
    icon: <MusicNoteIcon />,
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
