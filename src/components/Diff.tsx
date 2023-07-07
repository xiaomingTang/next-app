'use client'

import { useColorScheme } from '@mui/material/styles'

/**
 * 根据 PrefersColorSchema 返回对应的值
 */
export function DiffMode<T>(props: Record<'light' | 'dark', T>) {
  const { mode } = useColorScheme()
  if (mode === 'dark') {
    return props.dark
  }
  return props.light
}
