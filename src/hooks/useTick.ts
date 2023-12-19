import { useEventCallback } from '@mui/material'
import { useEffect } from 'react'

/**
 * @warn now 和 prev 都是 DOMHighResTimeStamp
 * ---
 * 如果 return false, prev 时间将会维持旧值, 直到 return 非 false;
 * 例如:
 * ``` ts
 * useTick((now, prev) => {
 *   if (now - prev < 200) {
 *     return false
 *   }
 *   // 在此之下的代码，每 200+ ms 才会被执行
 * })
 * ```
 */
type Callback = (now: number, prev: number) => boolean | undefined | void

export function useTick(callback: Callback, enabled = true) {
  const callbackRef = useEventCallback(callback)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }
    let active = true
    let prevTime = -1
    const rafCallback = (now: number) => {
      if (!active) {
        return
      }
      if (prevTime < 0) {
        prevTime = now
        window.requestAnimationFrame(rafCallback)
        return
      }
      if (callbackRef(now, prevTime) !== false) {
        prevTime = now
      }
      window.requestAnimationFrame(rafCallback)
    }
    window.requestAnimationFrame(rafCallback)

    return () => {
      prevTime = -1
      active = false
    }
  }, [callbackRef, enabled])
}
