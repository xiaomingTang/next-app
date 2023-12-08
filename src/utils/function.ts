import { sleepMs } from './time'

import { useEffect } from 'react'
import { noop } from 'lodash-es'
import { useEventCallback } from '@mui/material'

type Func<T = unknown> = () => T

export function loopCall(callback: Func): Func<void> {
  let stopLoop = false

  async function loop() {
    while (!stopLoop) {
      // eslint-disable-next-line no-await-in-loop
      await callback()
      // 必须 sleep 0, 防止 callback 是同步函数, 导致卡死事件循环
      // eslint-disable-next-line no-await-in-loop
      await sleepMs(0)
    }
  }

  // 启动循环
  loop()

  // 返回的函数用于停止循环
  return () => {
    stopLoop = true
  }
}

export function useLoopCall(enabled: boolean, callback: Func) {
  const callbackRef = useEventCallback(callback)
  useEffect(() => {
    if (enabled) {
      return noop
    }
    return loopCall(callbackRef)
  }, [callbackRef, enabled])
}
