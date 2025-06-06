import { Box } from '@mui/material'

import type { BoxProps } from '@mui/material'

interface StickyProps extends BoxProps {
  slogProps?: {
    root?: BoxProps
  }
}

export function Sticky({ sx, slogProps, ...props }: StickyProps) {
  const { sx: rootSx, ...restRootProps } = slogProps?.root || {}

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        pointerEvents: 'none',
        ...rootSx,
      }}
      {...restRootProps}
    >
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          height: 0,
          overflow: 'visible',
          pointerEvents: 'auto',
          ...sx,
        }}
        {...props}
      />
    </Box>
  )
}
