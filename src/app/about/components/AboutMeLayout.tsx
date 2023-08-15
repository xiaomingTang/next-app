'use client'

import { DefaultFooter } from '@/layout/DefaultFooter'
import { DefaultHeaderShim, DefaultRawHeader } from '@/layout/DefaultHeader'
import { FilePasteCatcher } from '@/layout/components/FilePasteCatcher'

import { Box, useTheme } from '@mui/material'

type AboutMeLayoutProps = React.HTMLAttributes<HTMLDivElement>

export function AboutMeLayout({ children, ...restProps }: AboutMeLayoutProps) {
  const theme = useTheme()
  return (
    <>
      <FilePasteCatcher />
      <Box sx={{ width: '100%', minHeight: '100vh' }}>
        <DefaultRawHeader />
        <DefaultHeaderShim />
        <Box
          component='main'
          sx={{
            width: '100%',
            maxWidth: theme.v.screens.desktop,
            mx: 'auto',
            p: 2,
          }}
          {...restProps}
        >
          {children}
        </Box>
      </Box>
      <DefaultFooter />
    </>
  )
}
