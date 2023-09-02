'use client'

import { dark, light } from '@/utils/theme'

import {
  ButtonBase,
  Link,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { common, blue } from '@mui/material/colors'

import type { SimpleFriendsLink } from '../server'
import type { LoadingAble } from '@/components/ServerComponent'
import type { SxProps, Theme } from '@mui/material'

function boxShadow(size: 'small' | 'medium', color: string) {
  const sizeMap = {
    small: '8px',
    medium: '12px',
  }
  return `0 0 ${sizeMap[size]} ${color}`
}

type FriendsLinkItemProps = LoadingAble<SimpleFriendsLink> & {
  sx?: SxProps<Theme>
}

function FriendsLinkName(friendsLink: FriendsLinkItemProps) {
  if (friendsLink.loading) {
    return <Skeleton width={`${friendsLink.size * 10}%`} height={24} />
  }
  return (
    <Typography component='h2' sx={{ fontWeight: 'bold' }}>
      {friendsLink.name}
    </Typography>
  )
}

function FriendsLinkDesc(friendsLink: FriendsLinkItemProps) {
  return (
    <Typography
      sx={{
        [dark()]: {
          backgroundColor: alpha(common.white, 0.025),
        },
        [light()]: {
          backgroundColor: alpha(common.black, 0.025),
        },
        p: 1,
        borderRadius: 1,
        fontSize: '0.8em',
      }}
    >
      {friendsLink.loading ? (
        <>
          <Skeleton width='100%' height={20} />
          <Skeleton width={`${friendsLink.size * 10}%`} height={20} />
        </>
      ) : (
        friendsLink.description
      )}
    </Typography>
  )
}

export function FriendsLinkItem({ sx, ...friendsLink }: FriendsLinkItemProps) {
  const friendsLinkDescAriaLabel = friendsLink.loading
    ? '加载中'
    : `友链站点：${friendsLink.name}；简介是：${friendsLink.description}`

  return (
    <ButtonBase
      sx={{
        p: 2,
        width: '100%',
        textAlign: 'start',
        borderRadius: 1,
        ':focus-visible': {
          outline: `1px solid ${blue[700]}`,
        },
        [dark()]: {
          backgroundColor: alpha(common.black, 0.55),
          boxShadow: boxShadow('small', alpha(common.black, 0.55)),
          ':hover': {
            backgroundColor: alpha(common.black, 0.35),
            boxShadow: boxShadow('medium', alpha(common.black, 0.35)),
          },
        },
        [light()]: {
          backgroundColor: common.white,
          boxShadow: boxShadow('small', common.white),
          ':hover': {
            backgroundColor: alpha(blue[100], 0.66),
            boxShadow: boxShadow('medium', alpha(blue[100], 0.66)),
          },
        },
        ...sx,
      }}
      LinkComponent={Link}
      disabled={friendsLink.loading}
      href={friendsLink.loading ? '/' : `/blog/${friendsLink.hash}`}
      aria-label={friendsLinkDescAriaLabel}
      role={friendsLink.loading ? 'none' : undefined}
    >
      <Stack direction='column' spacing={1} sx={{ width: '100%' }} aria-hidden>
        <FriendsLinkName {...friendsLink} />
        <FriendsLinkDesc {...friendsLink} />
      </Stack>
    </ButtonBase>
  )
}
