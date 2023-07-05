'use client'

import { DefaultRawHeader } from './DefaultHeader'

import { Box } from '@mui/material'

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <DefaultRawHeader />
      {children}
    </Box>
  )
}
