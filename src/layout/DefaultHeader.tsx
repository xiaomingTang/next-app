'use client'

import { UserButton } from './CornerButtons/UserButton'
import { ThemeToggleButton } from './CornerButtons/ThemeToggleButton'
import { Entry } from './CornerButtons/Entries'
import { MusicTriggerButton } from './CornerButtons/MusicTriggerButton'
import { UploadTrigger } from './CornerButtons/UploadTrigger'
import { BlogSearchButton } from './CornerButtons/BlogSearchButton'
import { QrcodeTrigger } from './CornerButtons/QrcodeTrigger'
import { CardsTrigger } from './CornerButtons/CardsTrigger'
import { MenuTrigger } from './CornerButtons/MenuTrigger'
import { ToolsTrigger } from './CornerButtons/ToolsTrigger'

import { dark } from '@/utils/theme'

import {
  AppBar,
  Box,
  Slide,
  Stack,
  alpha,
  useScrollTrigger,
  useTheme,
} from '@mui/material'

export function DefaultRawHeader() {
  const trigger = useScrollTrigger()
  const theme = useTheme()

  return (
    <Slide appear={false} direction='down' in={!trigger}>
      <AppBar
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
          backgroundColor: alpha(theme.palette.grey[300], 0.6),
          [dark()]: {
            backgroundColor: alpha(theme.palette.grey[900], 0.6),
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
            maxWidth: theme.v.screens.desktop,
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
            <CardsTrigger />
            <ToolsTrigger />
          </Stack>
          <Stack direction='row'>
            <UploadTrigger />
            <UserButton />
            <QrcodeTrigger />
            <BlogSearchButton />
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
