'use client'

import '@xterm/xterm/css/xterm.css'

import { sharedTerm } from '../TermProvider'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import { Box } from '@mui/material'

export function FFmpegRoot() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <DefaultHeaderShim />
      <Box
        ref={sharedTerm.initTerm.bind(sharedTerm)}
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          overflow: 'hidden',
          [`& .xterm`]: {
            width: '100%',
            height: '100%',
            padding: '8px',
          },
          [`& .xterm-underline-5`]: {
            textDecorationStyle: 'solid',
            [`&:hover`]: {
              color: 'primary.main',
            },
          },
        }}
      />
    </Box>
  )
}
