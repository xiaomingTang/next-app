'use client'

import { Box, useTheme } from '@mui/material'

type DefaultBodyContainerProps = React.HTMLAttributes<HTMLDivElement>

export function DefaultBodyContainer({
  children,
  ...restProps
}: DefaultBodyContainerProps) {
  const theme = useTheme()
  return (
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
  )
}
