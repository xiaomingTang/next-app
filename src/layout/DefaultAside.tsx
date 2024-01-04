'use client'

import {
  ASIDE_MARGIN,
  ASIDE_WIDTH,
  SCROLL_BAR_WIDTH,
  useDefaultAsideDetail,
} from './utils'

import { STYLE } from '@/config'
import { obj } from '@/utils/tiny'
import { useDelayedValue } from '@/hooks/useDelayedValue'
import { sleepMs } from '@/utils/time'

import { Box, useScrollTrigger } from '@mui/material'

import type { BoxProps } from '@mui/material'

type DefaultAsideProps = BoxProps & {
  placement: 'left' | 'right'
}

export function DefaultAside({
  placement,
  children,
  sx,
  ...props
}: DefaultAsideProps) {
  const trigger = useScrollTrigger()
  const { hasHeader, visible } = useDefaultAsideDetail()
  const visibility =
    useDelayedValue(async () => {
      if (visible) {
        return 'visible'
      }
      // 300ms 是动画时间
      await sleepMs(300)
      return 'hidden'
    }, [visible]) ?? 'visible'

  const top = hasHeader && !trigger ? 56 : 0

  /**
   * 50% 基准是不含滚动条的;
   * 50vw 基准是含滚动条的;
   */
  const left =
    placement === 'left'
      ? `calc(50vw - ${
          STYLE.width.desktop / 2 +
          ASIDE_WIDTH +
          ASIDE_MARGIN +
          SCROLL_BAR_WIDTH / 2
        }px)`
      : `calc(50vw + ${
          STYLE.width.desktop / 2 + ASIDE_MARGIN - SCROLL_BAR_WIDTH / 2
        }px)`

  return (
    <Box
      {...props}
      sx={{
        ...sx,
        position: 'fixed',
        width: `${ASIDE_WIDTH}px`,
        left,
        transition: 'opacity .3s, top .3s',

        pointerEvents: 'none',
        top: `${top + 16}px`,
        opacity: 0,
        visibility,
        ...obj(
          visible && {
            pointerEvents: 'auto',
            top: `${top}px`,
            opacity: 1,
          }
        ),
      }}
    >
      {children}
    </Box>
  )
}
