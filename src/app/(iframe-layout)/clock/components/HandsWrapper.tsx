import { Box } from '@mui/material'

import type { BoxProps } from '@mui/material'

export function HandsWrapper({ sx, ...props }: BoxProps) {
  return (
    <Box
      component='svg'
      viewBox='0 0 200 200'
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        ...sx,
      }}
      {...props}
    />
  )
}
