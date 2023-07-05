import { clamp, throttle } from 'lodash-es'
import { useEffect, useState } from 'react'

import type { RefObject } from 'react'

interface Props {
  elem: HTMLElement | RefObject<HTMLElement>
  scrollElem?: HTMLElement | RefObject<HTMLElement>
}

/**
 * @returns 该元素滚动过的 y 方向上的百分比
 */
export function useElementScroll({ elem, scrollElem }: Props) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const realScrollElem =
      (scrollElem instanceof HTMLElement ? scrollElem : scrollElem?.current) ??
      window

    const onScroll = throttle(
      () => {
        const realElem = elem instanceof HTMLElement ? elem : elem.current
        if (!realElem) {
          return
        }
        const rect = realElem.getBoundingClientRect()
        // 大于 0 说明还没滚到视野中
        if (rect.top > 0) {
          setPercent(0)
        } else {
          setPercent(clamp(rect.top / (window.innerHeight - rect.height), 0, 1))
        }
      },
      300,
      {
        leading: false,
        trailing: true,
      }
    )
    realScrollElem.addEventListener('scroll', onScroll)

    return () => {
      realScrollElem.removeEventListener('scroll', onScroll)
    }
  }, [elem, scrollElem])

  return { percent }
}
