import { loopCall } from './function'

import { useEffect } from 'react'
import { noop } from 'lodash-es'
import { useEventCallback } from '@mui/material'

import type { Func } from './function'

export function useLoopCall(enabled: boolean, callback: Func) {
  const callbackRef = useEventCallback(callback)
  useEffect(() => {
    if (enabled) {
      return noop
    }
    return loopCall(callbackRef)
  }, [callbackRef, enabled])
}
