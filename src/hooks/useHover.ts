import { noop } from 'lodash-es'
import { useState, type MutableRefObject, useEffect } from 'react'

export function useHover(
  ref: MutableRefObject<unknown> | null | undefined,
  enabled = true
) {
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return noop
    }
    const onMouseOver = () => setHovered(true)
    const onMouseOut = () => setHovered(false)
    const elem = ref?.current as HTMLElement | null
    if (elem) {
      elem.addEventListener('touchstart', onMouseOver)
      elem.addEventListener('mouseover', onMouseOver)

      elem.addEventListener('mouseout', onMouseOut)
      window.addEventListener('touchend', onMouseOut)
      window.addEventListener('touchcancel', onMouseOut)
    }
    return () => {
      if (elem) {
        elem.removeEventListener('touchstart', onMouseOver)
        elem.removeEventListener('mouseover', onMouseOver)

        elem.removeEventListener('mouseout', onMouseOut)
        window.removeEventListener('touchend', onMouseOut)
        window.removeEventListener('touchcancel', onMouseOut)
      }
    }
  }, [enabled, ref])

  return hovered
}
