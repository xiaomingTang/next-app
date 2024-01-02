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

    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', onChange)
    } else {
      window.addEventListener('orientationchange', onChange)
    }

    return () => {
      mounted = false
      window.screen.orientation?.removeEventListener('change', onChange)
      window.removeEventListener('orientationchange', onChange)
    }
  }, [initialState.angle, initialState.type])

  return state
}
