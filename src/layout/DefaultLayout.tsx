'use client'

import { DefaultFooter } from './DefaultFooter'
import { DefaultHeader } from './DefaultHeader'

import { Box } from '@mui/material'

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <>
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        <DefaultHeader />
        {children}
      </Box>
      <DefaultFooter />
    </>
  )
}
