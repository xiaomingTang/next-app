import { useEffect, useRef, useState } from 'react'

import type { OrientationState } from 'react-use/lib/useOrientation'

const defaultState: OrientationState = {
  angle: 0,
  type: 'landscape-primary',
}

export function useOrientation(initialState = defaultState) {
  const timerRef = useRef(-1)
  const [state, setState] = useState(initialState)

  useEffect(() => {
    let mounted = true
    const onChange = () => {
      if (!mounted) {
        return
      }
      window.clearTimeout(timerRef.current)
      const angle = window.screen.orientation?.angle ?? window.orientation
      const type = window.screen.orientation?.type ?? ''
      if (typeof angle === 'number') {
        setState({
          angle,
          type,
        })
        return
      }
      setState({
        angle: initialState.angle,
        type: initialState.type,
      })
    }

    onChange()

    const onOrientationChange = () => {
      onChange()
      /**
       * fix: ipad 在迅速连续翻转设备 (0-90-180) 时, 只会触发一次 orientationchange 事件,
       * 导致最终 angle 是错误的 90 (正确应该是 180)
       */
      timerRef.current = window.setTimeout(onChange, 1000)
    }

    window.addEventListener('orientationchange', onOrientationChange)

    return () => {
      mounted = false
      window.removeEventListener('orientationchange', onOrientationChange)
    }
  }, [initialState.angle, initialState.type])

  return state
}
