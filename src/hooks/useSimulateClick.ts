import { useEventCallback } from '@mui/material'
import { noop } from 'lodash-es'
import { useState, useEffect } from 'react'

type ClickHandler = (e: PointerEvent) => void | Promise<void>

interface PointerParam {
  time: number
  x: number
  y: number
}

const defaultPointer = {
  time: -1,
  x: -1,
  y: -1,
} satisfies PointerParam

function getParamFromPointerEvent(e: PointerEvent): PointerParam {
  return {
    time: Date.now(),
    x: e.pageX,
    y: e.pageY,
  }
}

function isLegalClick({
  prev,
  next,
  legalDelta,
}: {
  prev: PointerParam
  next: PointerParam
  legalDelta: PointerParam
}) {
  return (
    next.time - prev.time >= 0 &&
    next.time - prev.time <= legalDelta.time &&
    next.x - prev.x >= 0 &&
    next.x - prev.x <= legalDelta.x &&
    next.y - prev.y >= 0 &&
    next.y - prev.y <= legalDelta.y
  )
}

export function useSimulateClick({
  onClick: rawOnClick,
  legalDelta,
}: {
  onClick: ClickHandler
  legalDelta?: Partial<PointerParam>
}) {
  const [elem, setElem] = useState<HTMLElement | undefined | null>()
  const onClick = useEventCallback(rawOnClick)
  const legalDeltaTime = legalDelta?.time ?? Infinity
  const legalDeltaX = legalDelta?.x ?? 40
  const legalDeltaY = legalDelta?.y ?? 40

  useEffect(() => {
    if (!elem) {
      return noop
    }
    let lastPointer = defaultPointer
    const onPointerDown = (e: PointerEvent) => {
      lastPointer = getParamFromPointerEvent(e)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (
        isLegalClick({
          prev: lastPointer,
          next: getParamFromPointerEvent(e),
          legalDelta: {
            time: legalDeltaTime,
            x: legalDeltaX,
            y: legalDeltaY,
          },
        })
      ) {
        void onClick(e)
      }
      lastPointer = defaultPointer
    }
    elem.addEventListener('pointerdown', onPointerDown)
    elem.addEventListener('pointerup', onPointerUp)

    return () => {
      elem.removeEventListener('pointerdown', onPointerDown)
      elem.removeEventListener('pointerup', onPointerUp)
    }
  }, [elem, legalDeltaTime, legalDeltaX, legalDeltaY, onClick])

  return setElem
}
