'use client'

import { AnchorProvider } from '@/components/AnchorProvider'
import { AuthRequired } from '@/components/AuthRequired'
import Anchor from '@/components/Anchor'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import { Menu, MenuItem } from '@mui/material'
import { useRouter } from 'next/navigation'

import type { FriendsLinkStatus } from '@prisma/client'

const friendsLinkStatusList: {
  type: FriendsLinkStatus
  text: string
  url: string
}[] = [
  { type: 'ACCEPTED', text: '已接受', url: '/links' },
  { type: 'PENDING', text: '待处理', url: '/links/pending' },
  { type: 'REJECTED', text: '已拒绝', url: '/links/rejected' },
]

export function FriendsLinkManagerTrigger({
  activeHash,
}: {
  activeHash: FriendsLinkStatus | (string & {})
}) {
  const router = useRouter()
  return (
    <AuthRequired roles={['ADMIN']} fallback={null} silence>
      <AnchorProvider>
        {(anchorEl, setAnchorEl) => (
          <>
            <Anchor
              onClick={(e) => {
                setAnchorEl((prev) => (prev ? null : e.currentTarget))
              }}
            >
              管理
            </Anchor>
            <Menu
              id='friends-link-manager-trigger-menu'
              anchorEl={anchorEl}
              open={!!anchorEl}
              autoFocus
              onClose={() => setAnchorEl(null)}
            >
              {friendsLinkStatusList.map((item) => (
                <MenuItem
                  key={item.type}
                  selected={item.type === activeHash.toUpperCase()}
                  {...triggerMenuItemEvents((e, reason) => {
                    setAnchorEl(null)
                    if (reason === 'middleClick') {
                      window.open(item.url, '_blank')
                    } else {
                      router.push(item.url)
                    }
                  })}
                >
                  {item.text}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </AnchorProvider>
    </AuthRequired>
  )
}
