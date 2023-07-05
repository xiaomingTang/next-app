'use client'

import { usePrefersColorSchema } from '@/common/contexts/PrefersColorSchema'

/**
 * 根据 PrefersColorSchema 返回对应的值
 */
export function DiffMode<T>(props: { light: T; dark: T }) {
  const { mode } = usePrefersColorSchema()
  return props[mode]
}
