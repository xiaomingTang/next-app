import { useEffect, useState } from 'react'
import { throttle } from 'lodash-es'

interface Size {
  width: number
  height: number
}

export function useElementSize<T extends HTMLElement = HTMLElement>() {
  const [elem, setElem] = useState<T | null | undefined>()
  const [size, setSize] = useState<Size>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    let isUnloaded = false
    const rawOnResize = () => {
      if (!elem || isUnloaded) {
        return
      }
      // 未被卸载才执行 setState
      // (由于被 throttle, 可能在组件被卸载之后仍在执行, 所以需要加一个 flag)
      setSize({
        width: elem.clientWidth,
        height: elem.clientHeight,
      })
    }
    const onResize = throttle(rawOnResize, 500, {
      leading: false,
      trailing: true,
    })

    const onVisibilityChange = () => {
      if (!document.hidden) {
        rawOnResize()
      }
    }

    rawOnResize()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      isUnloaded = true
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [elem])

  return [size, elem, setElem] as const
}
