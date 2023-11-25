import useEnhancedEffect from '@mui/material/utils/useEnhancedEffect'
import { useRef } from 'react'

/**
 * @example
 * ``` tsx
 * function Component() {
 *   const [count, setCount] = useState(0)
 *
 *   // will be triggered when count changed
 *   useListen(count, (prev, next) => {
 *     console.log(prev, next)
 *   })
 * }
 * ```
 */
export function useListen<T>(
  value: T,
  callback: (next: T, prev: T | undefined) => void
) {
  const prevRef = useRef(value)
  const callbackRef = useRef(callback)

  useEnhancedEffect(() => {
    callbackRef.current = callback
  })

  useEnhancedEffect(() => {
    // useEffect 在 dev 环境会执行 2 遍, 此处避免该行为造成的影响
    if (value === prevRef.current) {
      return
    }
    callbackRef.current(value, prevRef.current)
    prevRef.current = value
  }, [value])
}
