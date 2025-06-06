'use client'

import { UserButton } from './CornerButtons/UserButton'
import { ThemeToggleButton } from './CornerButtons/ThemeToggleButton'
import { Entry } from './CornerButtons/Entries'
import { MusicTriggerButton } from './CornerButtons/MusicTriggerButton'
import { SearchButton } from './CornerButtons/search/SearchButton'
import { QrcodeTrigger } from './CornerButtons/QrcodeTrigger'
import { MenuTrigger } from './CornerButtons/MenuTrigger'
import { ToolsTrigger } from './CornerButtons/ToolsTrigger'
import { HEADER_ID } from './constants'

import { dark } from '@/utils/theme'
import { STYLE } from '@/config'

import {
  AppBar,
  Box,
  Slide,
  Stack,
  alpha,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from '@mui/material'
import { grey } from '@mui/material/colors'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const UploadTrigger = dynamic(() =>
  import('./CornerButtons/UploadTrigger').then((res) => res.UploadTrigger)
)

export function DefaultRawHeader() {
  const trigger = useScrollTrigger()
  const theme = useTheme()

  return (
    <Slide appear={false} direction='down' in={!trigger}>
      <AppBar
        id={HEADER_ID}
        position='fixed'
        sx={{
          zIndex: theme.zIndex.appBar,
          height: {
            xs: '40px',
            sm: '56px',
          },
          backdropFilter: 'blur(8px)',
          boxShadow: 'none',
          color: 'text.primary',
          backgroundColor: alpha(grey[300], 0.6),
          [dark()]: {
            backgroundColor: alpha(grey[900], 0.6),
          },
        }}
      >
        <Stack
          direction='row'
          sx={{
            height: '100%',
            width: '100%',
            px: 1,
            alignItems: 'center',
            maxWidth: STYLE.width.desktop,
            m: 'auto',
          }}
        >
          {/* 移动端 */}
          <Stack
            direction='row'
            sx={{
              flex: '1 1 0%',
              display: {
                xs: 'flex',
                sm: 'none',
              },
            }}
          >
            <MenuTrigger />
            <Entry pathname='/' name='首页' />
          </Stack>
          {/* 大于移动端 */}
          <Stack
            direction='row'
            sx={{
              flex: '1 1 0%',
              display: {
                xs: 'none',
                sm: 'flex',
              },
            }}
          >
            <Entry pathname='/' name='首页' />
            <Entry pathname='/blog/3EpPJTM2LwB_' name='关于' />
            <Entry pathname='/links' name='友链' />
            <ToolsTrigger />
          </Stack>
          <Stack direction='row'>
            <UploadTrigger />
            <UserButton />
            <QrcodeTrigger />
            <SearchButton />
            <ThemeToggleButton />
            <MusicTriggerButton />
          </Stack>
        </Stack>
      </AppBar>
    </Slide>
  )
}

export function DefaultHeaderShim() {
  return (
    <Box
      sx={{
        height: {
          xs: '40px',
          sm: '56px',
        },
        flex: 'none',
        flexShrink: 0,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    />
  )
}

export function DefaultHeader() {
  return (
    <>
      <DefaultRawHeader />
      <DefaultHeaderShim />
    </>
  )
}

export function useHeaderState() {
  const [hasHeader, setHasHeader] = useState(true)
  const visible = !useScrollTrigger() && hasHeader
  const isXs = useMediaQuery(useTheme().breakpoints.down('sm'))
  const physicalHeight = !hasHeader ? 0 : isXs ? 40 : 56

  useEffect(() => {
    setHasHeader(!!document.querySelector(`#${HEADER_ID}`))
  }, [])

  return {
    physicalHeight,
    visualHeight: visible ? physicalHeight : 0,
    visible,
    hasHeader,
  }
}
