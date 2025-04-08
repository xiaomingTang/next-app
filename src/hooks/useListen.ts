import {
  unstable_useEnhancedEffect as useEnhancedEffect,
  useEventCallback,
} from '@mui/material'
import { useRef } from 'react'

/**
 * @example
 * ``` tsx
 * function Component() {
 *   const [count, setCount] = useState(0)
 *
 *   // will be triggered when count changed
 *   useListen(count, (next, prev) => {
 *     console.log(next, prev)
 *   })
 * }
 * ```
 */
export function useListen<T>(
  value: T,
  callback: (next: T, prev: T | undefined) => void
) {
  const isFirstCallbackRef = useRef(true)
  const prevRef = useRef<T>(undefined)
  const callbackRef = useEventCallback(callback)

  useEnhancedEffect(() => {
    // useEffect 在 dev 环境会执行 2 遍, 此处避免该行为造成的影响
    if (value === prevRef.current && !isFirstCallbackRef.current) {
      return
    }
    isFirstCallbackRef.current = false
    callbackRef(value, prevRef.current)
    prevRef.current = value
  }, [value, callbackRef])
}
