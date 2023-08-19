'use client'

import { Box, useTheme } from '@mui/material'

import type { BoxProps } from '@mui/material'

type DefaultAsideProps = BoxProps & {
  placement: 'left' | 'right'
}

const ASIDE_WIDTH = 256
const ASIDE_MARGIN = 0

export function DefaultAside({
  placement,
  children,
  sx,
  ...props
}: DefaultAsideProps) {
  const theme = useTheme()
  return (
    <Box
      {...props}
      sx={{
        ...sx,
        position: 'fixed',
        width: `${ASIDE_WIDTH}px`,
        top: '56px',
        left:
          placement === 'left'
            ? `calc(50% - ${
                theme.v.screens.desktop / 2 + ASIDE_WIDTH + ASIDE_MARGIN
              }px)`
            : `calc(50% + ${theme.v.screens.desktop / 2 + ASIDE_MARGIN}px)`,
        [theme.breakpoints.down(
          // 17 是竖直滚动条的宽度
          theme.v.screens.desktop + ASIDE_WIDTH * 2 + ASIDE_MARGIN * 2 + 17
        )]: {
          display: 'none',
        },
      }}
    >
      {children}
    </Box>
  )
}
