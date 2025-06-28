'use client'

import useWindowSize from '@/hooks/useWindowSize'

import { useEffect } from 'react'

export function PolyfillVH() {
  const { height } = useWindowSize('inner')
  useEffect(() => {
    document.documentElement.style.setProperty('--vh', `${height / 100}px`)
  }, [height])

  return null
}
