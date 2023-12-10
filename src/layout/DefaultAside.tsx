import { STYLE } from '@/config'

import { Box } from '@mui/material'

import type { BoxProps } from '@mui/material'

type DefaultAsideProps = BoxProps & {
  placement: 'left' | 'right'
}

const ASIDE_WIDTH = 256
const ASIDE_MARGIN = 0
// 17 是竖直滚动条的宽度
const SCROLL_BAR_WIDTH = 17

export function DefaultAside({
  placement,
  children,
  sx,
  ...props
}: DefaultAsideProps) {
  return (
    <Box
      {...props}
      sx={{
        ...sx,
        position: 'fixed',
        width: `${ASIDE_WIDTH}px`,
        top: '56px',
        /**
         * 50% 基准是不含滚动条的;
         * 50vw 基准是含滚动条的;
         */
        left:
          placement === 'left'
            ? `calc(50vw - ${
                STYLE.width.desktop / 2 +
                ASIDE_WIDTH +
                ASIDE_MARGIN +
                SCROLL_BAR_WIDTH / 2
              }px)`
            : `calc(50vw + ${
                STYLE.width.desktop / 2 + ASIDE_MARGIN - SCROLL_BAR_WIDTH / 2
              }px)`,
        [`@media screen and (max-width: ${
          STYLE.width.desktop +
          ASIDE_WIDTH * 2 +
          ASIDE_MARGIN * 2 +
          SCROLL_BAR_WIDTH
        }px)`]: {
          display: 'none',
        },
      }}
    >
      {children}
    </Box>
  )
}
