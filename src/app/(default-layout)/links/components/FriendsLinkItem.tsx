'use client'

import { FriendsLinkStatusMap } from './constants'
import { editFriendsLink } from './EditLink'

import { dark } from '@/utils/theme'
import { cat } from '@/errors/catchAndToast'
import { ImageWithState } from '@/components/ImageWithState'
import { useUser } from '@/user'

import { ButtonBase, Skeleton, Stack, Typography, alpha } from '@mui/material'
import { common, blue } from '@mui/material/colors'
import { useRouter } from 'next/navigation'

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
      {friendsLink.status !== 'ACCEPTED' && (
        <>{FriendsLinkStatusMap[friendsLink.status].name} </>
      )}
      {friendsLink.name}
    </Typography>
  )
}

function FriendsLinkDesc(friendsLink: FriendsLinkItemProps) {
  return (
    <Typography
      sx={{
        backgroundColor: alpha(common.black, 0.05),
        [dark()]: {
          backgroundColor: alpha(common.white, 0.05),
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
        friendsLink.description || '无描述'
      )}
    </Typography>
  )
}

export function FriendsLinkItem({ sx, ...friendsLink }: FriendsLinkItemProps) {
  const router = useRouter()
  const isAdmin = useUser().role === 'ADMIN'
  const friendsLinkDescAriaLabel = `友链站点：${friendsLink.name}；简介是：${friendsLink.description}`

  const btnSx: SxProps = {
    display: 'flex',
    alignItems: 'flex-start',
    p: 2,
    width: '100%',
    textAlign: 'start',
    borderRadius: 1,
    ':focus-visible': {
      outline: `1px solid ${blue[700]}`,
    },
    backgroundColor: common.white,
    boxShadow: boxShadow('small', common.white),
    ':hover': {
      backgroundColor: alpha(blue[100], 0.66),
      boxShadow: boxShadow('medium', alpha(blue[100], 0.66)),
    },
    [dark()]: {
      backgroundColor: alpha(common.black, 0.55),
      boxShadow: boxShadow('small', alpha(common.black, 0.55)),
      ':hover': {
        backgroundColor: alpha(common.black, 0.35),
        boxShadow: boxShadow('medium', alpha(common.black, 0.35)),
      },
    },
    ...sx,
  }

  const children = (
    <>
      <ImageWithState
        src={friendsLink.image || '/pwa/android-chrome-512x512.png'}
        width={60}
        height={60}
        alt={friendsLink.name}
        style={{
          width: 60,
          flexShrink: '0',
          // 此处是 minHeight, 是为了当右边过高时, 左边图片能占满
          minHeight: 60,
          objectFit: 'cover',
          marginRight: '12px',
        }}
      />
      <Stack direction='column' spacing={1} sx={{ width: '100%' }} aria-hidden>
        <FriendsLinkName {...friendsLink} />
        <FriendsLinkDesc {...friendsLink} />
      </Stack>
    </>
  )

  if (friendsLink.loading) {
    return (
      <ButtonBase sx={btnSx} disabled role='none'>
        {children}
      </ButtonBase>
    )
  }

  if (isAdmin) {
    return (
      <ButtonBase
        sx={btnSx}
        aria-label={friendsLinkDescAriaLabel}
        onClick={cat(async () => {
          await editFriendsLink(friendsLink)
          router.refresh()
        })}
      >
        {children}
      </ButtonBase>
    )
  }

  return (
    <ButtonBase
      sx={btnSx}
      aria-label={friendsLinkDescAriaLabel}
      LinkComponent='a'
      // 由于是友链, 所以不应添加 nofollow 等值, 仅一个为了安全的 noopener
      rel='noopener'
      target='_blank'
      href={friendsLink.url}
    >
      {children}
    </ButtonBase>
  )
}
