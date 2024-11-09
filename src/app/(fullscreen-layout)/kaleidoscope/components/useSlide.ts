import { getSingleEvent } from '@/utils/pointerLike'

import { clamp, noop } from 'lodash-es'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { PointerLikeEvent } from '@/utils/pointerLike'

interface UseSlideProps {
  direction: 'x' | 'y'
  defaultValue: number
  min: number
  max: number
}

export function useSlide({ direction, defaultValue, min, max }: UseSlideProps) {
  const [value, setValue] = useState(defaultValue)
  const [isSetting, setIsSetting] = useState(false)
  const prevValueRef = useRef(0)

  useEffect(() => {
    if (isSetting) {
      const onMove = (e: PointerLikeEvent) => {
        const se = getSingleEvent(e)
        const clientSize = direction === 'x' ? se.clientX : se.clientY
        const dx = clientSize - prevValueRef.current
        setValue((prev) => clamp(prev + dx, min, max))
        prevValueRef.current = clientSize
      }
      const onEnd = () => {
        setIsSetting(false)
      }

      window.addEventListener('mousemove', onMove, true)
      window.addEventListener('touchmove', onMove, true)
      window.addEventListener('mouseup', onEnd, true)
      window.addEventListener('touchend', onEnd, true)
      window.addEventListener('touchcancel', onEnd, true)

      return () => {
        window.removeEventListener('mousemove', onMove, true)
        window.removeEventListener('touchmove', onMove, true)
        window.removeEventListener('mouseup', onEnd, true)
        window.removeEventListener('touchend', onEnd, true)
        window.removeEventListener('touchcancel', onEnd, true)
      }
    }
    return noop
  }, [direction, isSetting, max, min])

  const onStart = useCallback(
    (e: PointerLikeEvent) => {
      e.preventDefault()
      setIsSetting(true)
      const se = getSingleEvent(e)
      prevValueRef.current = direction === 'x' ? se.clientX : se.clientY
    },
    [direction]
  )

  return {
    value,
    isSetting,
    onStart,
  }
}
