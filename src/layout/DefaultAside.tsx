'use client'

import { HEADER_ID } from './constants'

import { STYLE } from '@/config'
import { obj } from '@/utils/tiny'
import { useDelayedValue } from '@/hooks/useDelayedValue'
import { sleepMs } from '@/utils/time'

import { Box, useMediaQuery, useScrollTrigger } from '@mui/material'
import { useEffect, useState } from 'react'

import type { BoxProps } from '@mui/material'

type DefaultAsideProps = BoxProps & {
  placement: 'left' | 'right'
}

const ASIDE_WIDTH = 256
const ASIDE_MARGIN = 0
// 17 是竖直滚动条的宽度
const SCROLL_BAR_WIDTH = 17

const wideQuery = `@media screen and (min-width: ${
  STYLE.width.desktop + ASIDE_WIDTH * 2 + ASIDE_MARGIN * 2 + SCROLL_BAR_WIDTH
}px)`

function useAsideDetail() {
  const [hasHeader, setHasHeader] = useState(false)
  const [visible, setVisible] = useState(false)
  const isWide = useMediaQuery(wideQuery)

  useEffect(() => {
    setVisible(isWide)
  }, [isWide])

  useEffect(() => {
    setHasHeader(!!document.querySelector(`#${HEADER_ID}`))
  }, [])

  return {
    hasHeader,
    visible,
  }
}

export function DefaultAside({
  placement,
  children,
  sx,
  ...props
}: DefaultAsideProps) {
  const trigger = useScrollTrigger()
  const { hasHeader, visible } = useAsideDetail()
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
