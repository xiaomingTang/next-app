import { noop } from 'lodash-es'
import { useState, useEffect } from 'react'

export function useHover() {
  const [hovered, setHovered] = useState(false)
  const [elem, setElem] = useState<HTMLElement | undefined | null>()

  useEffect(() => {
    if (!elem) {
      return noop
    }
    const onEnter = () => setHovered(true)
    const onLeave = () => setHovered(false)
    elem.addEventListener('pointerenter', onEnter)
    elem.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointercancel', onLeave)

    return () => {
      elem.removeEventListener('pointerenter', onEnter)
      elem.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointercancel', onLeave)
    }
  }, [elem])

  return [hovered, setElem] as const
}
