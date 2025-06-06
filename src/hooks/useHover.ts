import { useTouchable } from '@/utils/device'

import { noop } from 'lodash-es'
import { useState, useEffect } from 'react'

export function useHover() {
  const touchable = useTouchable()
  const [hovered, setHovered] = useState(false)
  const [elem, setElem] = useState<HTMLElement | undefined | null>()

  useEffect(() => {
    if (!elem) {
      return noop
    }
    const onEnter = () => setHovered(true)
    const onLeave = () => setHovered(false)
    const onTouchOut = (e: TouchEvent) => {
      if (!elem.contains(e.target as Node)) {
        setHovered(false)
      }
    }

    if (touchable) {
      elem.addEventListener('touchstart', onEnter, { passive: true })
      window.addEventListener('touchstart', onTouchOut, { passive: true })
    } else {
      elem.addEventListener('mouseenter', onEnter, { passive: true })
      elem.addEventListener('mouseleave', onLeave, { passive: true })
    }
    window.addEventListener('pointercancel', onLeave)

    return () => {
      elem.removeEventListener('touchstart', onEnter)
      window.removeEventListener('touchstart', onTouchOut)
      elem.removeEventListener('mouseenter', onEnter)
      elem.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('pointercancel', onLeave)
    }
  }, [elem, touchable])

  return [hovered, setElem] as const
}
