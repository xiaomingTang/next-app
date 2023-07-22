'use client'

import { useHydrated } from '@/hooks/useHydrated'

import { useColorScheme } from '@mui/material/styles'

/**
 * 根据 PrefersColorSchema 返回对应的值
 */
export function DiffMode<T>(props: Record<'light' | 'dark', T>) {
  const { mode } = useColorScheme()
  const hydrated = useHydrated()
  if (!hydrated) {
    return props.light
  }
  return mode === 'dark' ? props.dark : props.light
}
