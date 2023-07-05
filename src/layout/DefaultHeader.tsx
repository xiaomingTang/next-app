'use client'

import { UserButton } from './CornerButtons/UserButton'
import { ThemeToggleButton } from './CornerButtons/ThemeToggleButton'
import { BlogEntry, HomeEntry } from './CornerButtons/Entries'

import { DiffMode } from '@/components/Diff'

import { grey } from '@mui/material/colors'
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
          ...DiffMode({
            dark: {
              backgroundColor: alpha(grey[900], 0.6),
              color: grey[200],
            },
            light: {
              backgroundColor: alpha(grey[300], 0.6),
              color: grey[800],
            },
          }),
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
          <Stack direction='row' sx={{ height: '100%', flex: '1 1 0%' }}>
            <HomeEntry />
            <BlogEntry />
          </Stack>
          <Stack direction='row'>
            <UserButton />
            <ThemeToggleButton />
          </Stack>
        </Stack>
      </AppBar>
    </Slide>
  )
}

export function DefaultHeader() {
  const theme = useTheme()
  return (
    <>
      <DefaultRawHeader />
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
    </>
  )
}
