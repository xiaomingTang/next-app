import { useEventCallback } from '@mui/material'
import { noop } from 'lodash-es'
import { useEffect, useState } from 'react'

import type { Func } from '@/errors/utils'

export function useDelayedValue<T>(
  callback: Func<[], Promise<T>>,
  deps: unknown[]
) {
  const callbackRef = useEventCallback(callback)
  const [value, setValue] = useState<T | null>(null)

  useEffect(() => {
    let expired = false
    setValue(null)
    callbackRef()
      .then((res) => {
        if (!expired) {
          setValue(res)
        }
      })
      .catch(noop)

    return () => {
      expired = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callbackRef, ...deps])

  return value
}
