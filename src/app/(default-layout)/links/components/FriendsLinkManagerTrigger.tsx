'use client'

import { FriendsLinkStatusMap } from './constants'

import { getFriendsLinkCounts } from '../server'

import { AnchorProvider } from '@/components/AnchorProvider'
import { AuthRequired } from '@/components/AuthRequired'
import Anchor from '@/components/Anchor'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'
import { SA } from '@/errors/utils'

import { Badge, Menu, MenuItem } from '@mui/material'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

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
  const { data: counts } = useSWR('getFriendsLinkCounts', () =>
    getFriendsLinkCounts().then(SA.decode)
  )
  const pendingCount =
    counts?.find((c) => c.status === 'PENDING')?._count.status ?? 0
  return (
    <AuthRequired roles={['ADMIN']} fallback={null} silence>
      <AnchorProvider>
        {(anchorEl, setAnchorEl) => {
          const trigger = (
            <Anchor
              onClick={(e) => {
                setAnchorEl((prev) => (prev ? null : e.currentTarget))
              }}
            >
              管理
            </Anchor>
          )
          return (
            <>
              {pendingCount === 0 ? (
                trigger
              ) : (
                <Badge color='warning' badgeContent={pendingCount.toString()}>
                  {trigger}
                </Badge>
              )}

              <Menu
                id='friends-link-manager-trigger-menu'
                anchorEl={anchorEl}
                open={!!anchorEl}
                autoFocus
                onClose={() => setAnchorEl(null)}
              >
                {friendsLinkStatusList.map((item) => {
                  const menuText = FriendsLinkStatusMap[item.type].name
                  return (
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
                      {item.type === 'PENDING' && pendingCount > 0 ? (
                        <Badge
                          color='warning'
                          badgeContent={pendingCount.toString()}
                        >
                          {menuText}
                        </Badge>
                      ) : (
                        menuText
                      )}
                    </MenuItem>
                  )
                })}
              </Menu>
            </>
          )
        }}
      </AnchorProvider>
    </AuthRequired>
  )
}
