'use client'

import { HEADER_ID } from './constants'

import { STYLE } from '@/config'

import { useMediaQuery } from '@mui/material'
import { useState, useEffect } from 'react'

export const ASIDE_WIDTH = 256
export const ASIDE_MARGIN = 0
// 17 是竖直滚动条的宽度
export const SCROLL_BAR_WIDTH = 17

export const wideQuery = `@media screen and (min-width: ${
  STYLE.width.desktop + ASIDE_WIDTH * 2 + ASIDE_MARGIN * 2 + SCROLL_BAR_WIDTH
}px)`

export function useDefaultAsideDetail() {
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
