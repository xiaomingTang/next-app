'use client'

import clsx from 'clsx'
import { Box } from '@mui/material'
import { useCallback, useRef } from 'react'

export function useScrollToTop(display: 'inline' | 'block') {
  const scrollStarterRef = useRef<HTMLDivElement>(null)

  const element = (
    <Box
      ref={scrollStarterRef}
      className={clsx(
        '-translate-y-10 md:-translate-y-14 overflow-hidden pointer-events-none',
        display === 'inline' ? 'w-0 h-[1em]' : ''
      )}
    />
  )

  const scrollToTop = useCallback(() => {
    scrollStarterRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [])

  return {
    element,
    elementRef: scrollStarterRef,
    scrollToTop,
  }
}
