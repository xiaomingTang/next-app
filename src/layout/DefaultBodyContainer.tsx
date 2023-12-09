import { STYLE } from '@/config'

import { Box } from '@mui/material'

type DefaultBodyContainerProps = React.HTMLAttributes<HTMLDivElement>

export function DefaultBodyContainer({
  children,
  ...restProps
}: DefaultBodyContainerProps) {
  return (
    <Box
      component='main'
      sx={{
        width: '100%',
        maxWidth: STYLE.width.desktop,
        minHeight: '100vh',
        mx: 'auto',
        p: 2,
      }}
      {...restProps}
    >
      {children}
    </Box>
  )
}
