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
        sx={{
          boxShadow: 'none',
          zIndex: theme.zIndex.appBar,
          height: '56px',
          [theme.breakpoints.down('sm')]: {
            height: '40px',
          },
          backdropFilter: 'blur(8px)',
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
              [theme.breakpoints.up('sm')]: {
                display: 'none',
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
              [theme.breakpoints.down('sm')]: {
                display: 'none',
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
  const theme = useTheme()
  return (
    <Box
      sx={{
        height: '56px',
        [theme.breakpoints.down('sm')]: {
          height: '40px',
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
