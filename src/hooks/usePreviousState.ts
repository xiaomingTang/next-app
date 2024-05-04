import { useEffect, useState } from 'react'

export function usePreviousState<T>(state: T) {
  const [previous, setPrevious] = useState<T | undefined>()

  useEffect(
    () => () => {
      setPrevious(state)
    },
    [state]
  )

  return [previous, setPrevious] as const
}
