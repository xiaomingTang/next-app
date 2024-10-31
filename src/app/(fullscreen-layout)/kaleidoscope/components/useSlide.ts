import { clamp, noop } from 'lodash-es'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSlideProps {
  direction: 'x' | 'y'
  defaultValue: number
  min: number
  max: number
}

type PointerLikeEvent =
  | MouseEvent
  | TouchEvent
  | React.MouseEvent<HTMLButtonElement, MouseEvent>
  | React.TouchEvent<HTMLButtonElement>

function getClient(direction: 'x' | 'y', e: PointerLikeEvent) {
  if (direction === 'x') {
    return 'clientX' in e ? e.clientX : e.touches[0].clientX
  }
  return 'clientY' in e ? e.clientY : e.touches[0].clientY
}

export function useSlide({ direction, defaultValue, min, max }: UseSlideProps) {
  const [value, setValue] = useState(defaultValue)
  const [isSetting, setIsSetting] = useState(false)
  const pxRef = useRef(0)

  useEffect(() => {
    if (isSetting) {
      const onMove = (e: MouseEvent | TouchEvent) => {
        const clientX = getClient(direction, e)
        const dx = clientX - pxRef.current
        setValue((prev) => clamp(prev + dx, min, max))
        pxRef.current = clientX
      }
      const onEnd = (_: MouseEvent | TouchEvent) => {
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
      pxRef.current = getClient(direction, e)
    },
    [direction]
  )

  return {
    value,
    isSetting,
    onStart,
  }
}
