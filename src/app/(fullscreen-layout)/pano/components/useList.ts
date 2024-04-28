import { useMemo, useState } from 'react'

export function useList<T>(list: T[], initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const activeInstance = useMemo(() => list[activeIndex], [activeIndex, list])
  return [activeIndex, activeInstance, setActiveIndex] as const
}
