import { useTouchable } from '@/utils/device'

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

interface UseSimulateClickParams {
  onClick: ClickHandler
  legalDelta?: Partial<PointerParam>
  /**
   * 是否抑制 触摸设备上 在模拟点击事件后，短时间内的合成 click 事件。
   * @WARNING 如果设为 true，会导致模拟点击事件触发后，300ms 内 **整个 document** 无法触发 click 事件。
   */
  shouldSuppressClickFromTouch?: boolean
}

export function useSimulateClick({
  onClick: rawOnClick,
  legalDelta,
  shouldSuppressClickFromTouch = false,
}: UseSimulateClickParams) {
  const touchable = useTouchable()
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
    elem.addEventListener('pointerdown', onPointerDown, { passive: true })
    elem.addEventListener('pointerup', onPointerUp)

    return () => {
      elem.removeEventListener('pointerdown', onPointerDown)
      elem.removeEventListener('pointerup', onPointerUp)
    }
  }, [elem, legalDeltaTime, legalDeltaX, legalDeltaY, onClick])

  useEffect(() => {
    if (!elem || !shouldSuppressClickFromTouch || !touchable) {
      return noop
    }
    let suppressClick = false
    let timer = -1

    elem.addEventListener('pointerup', () => {
      window.clearTimeout(timer)
      suppressClick = true

      // 清除抑制状态，300ms 可根据需要调整
      timer = window.setTimeout(() => {
        suppressClick = false
      }, 300)
    })

    // 捕获阶段 阻止 click 事件
    document.addEventListener(
      'click',
      (e) => {
        if (suppressClick) {
          e.stopImmediatePropagation()
          e.preventDefault()
        }
      },
      true
    )
  }, [elem, shouldSuppressClickFromTouch, touchable])

  return setElem
}
