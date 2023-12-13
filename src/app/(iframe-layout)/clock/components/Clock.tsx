import { dark } from '@/utils/theme'

import { Box, type BoxProps } from '@mui/material'
import { grey } from '@mui/material/colors'

export function Clock({ sx, children, ...props }: BoxProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        '--bg': '#eee',
        [dark()]: {
          '--bg': '#4d4d4d',
          color: grey[400],
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
