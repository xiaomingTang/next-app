'use client'

import { UserButton } from './CornerButtons/UserButton'
import { ThemeToggleButton } from './CornerButtons/ThemeToggleButton'
import { Entry } from './CornerButtons/Entries'
import { RssButton } from './CornerButtons/RssButton'
import { UploadTrigger } from './CornerButtons/UploadTrigger'
import { BlogSearchButton } from './CornerButtons/BlogSearchButton'
import { QRCodeTrigger } from './CornerButtons/QRCodeTrigger'
import { CardsTrigger } from './CornerButtons/CardsTrigger'
import { MenuTrigger } from './CornerButtons/MenuTrigger'

import { dark, light } from '@/utils/theme'

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
          [dark()]: {
            backgroundColor: alpha(theme.palette.grey[900], 0.6),
          },
          [light()]: {
            backgroundColor: alpha(theme.palette.grey[300], 0.6),
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
            <Entry pathname='/about' name='关于' />
            <CardsTrigger />
          </Stack>
          <Stack direction='row'>
            <UploadTrigger />
            <UserButton />
            <QRCodeTrigger />
            <BlogSearchButton />
            <ThemeToggleButton />
            <RssButton />
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
