import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(
  value: T,
  props?: {
    delay?: number
    deps?: unknown[]
  }
) {
  const delay = props?.delay ?? 1000
  const deps = props?.deps ?? [value, delay]
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return debouncedValue
}
