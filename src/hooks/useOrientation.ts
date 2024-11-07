import { useEffect, useState } from 'react'

import type { OrientationState } from 'react-use/lib/useOrientation'

const defaultState: OrientationState = {
  angle: 0,
  type: 'landscape-primary',
}

export function useOrientation(initialState = defaultState) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    let mounted = true
    // 强行 as 为 undefined, 避免漏了兼容性判断
    const orientation = window.screen.orientation as
      | ScreenOrientation
      | undefined

    const onChange = () => {
      if (!mounted) {
        return
      }
      if (orientation) {
        setState({
          type: orientation.type,
          angle: orientation.angle,
        })
        return
      }
      if (typeof window.orientation === 'number') {
        setState({
          angle: window.orientation,
          type: '',
        })
        return
      }
      setState({
        angle: initialState.angle,
        type: initialState.type,
      })
    }

    onChange()

    if (orientation) {
      orientation.addEventListener('change', onChange)
    } else {
      window.addEventListener('orientationchange', onChange)
    }

    return () => {
      mounted = false
      orientation?.removeEventListener('change', onChange)
      window.removeEventListener('orientationchange', onChange)
    }
  }, [initialState.angle, initialState.type])

  return state
}
