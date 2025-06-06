'use client'

import { STYLE } from '@/config'

import { useMediaQuery } from '@mui/material'

export const ASIDE_WIDTH = 256
export const ASIDE_MARGIN = 0
// 17 是竖直滚动条的宽度
export const SCROLL_BAR_WIDTH = 17

export const wideQuery = `@media screen and (min-width: ${
  STYLE.width.desktop + ASIDE_WIDTH * 2 + ASIDE_MARGIN * 2 + SCROLL_BAR_WIDTH
}px)`

export function useAsideVisible() {
  return useMediaQuery(wideQuery)
}
