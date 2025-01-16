import { useEffect, useState } from 'react'
import { throttle } from 'lodash-es'

type GetWindowSizeType = 'inner' | 'outer'

interface Size {
  width: number
  height: number
}

export interface WindowSize {
  innerWidth: number
  innerHeight: number
  outerWidth: number
  outerHeight: number
}

const defaultSize: WindowSize = {
  innerWidth: -1,
  innerHeight: -1,
  outerWidth: -1,
  outerHeight: -1,
}

export function getWindowSize(type: GetWindowSizeType): Size {
  const widthKey = `${type}Width` as const
  const heightKey = `${type}Height` as const
  if (typeof window === 'undefined') {
    return {
      width: defaultSize[widthKey],
      height: defaultSize[heightKey],
    }
  }
  return {
    width: window[widthKey],
    height: window[heightKey],
  }
}

export default function useWindowSize(type: GetWindowSizeType) {
  const [size, setSize] = useState<Size>({
    width: defaultSize[`${type}Width`],
    height: defaultSize[`${type}Height`],
  })

  useEffect(() => {
    let isUnloaded = false
    const rawOnResize = () => {
      // 未被卸载才执行 setState
      // (由于被 throttle, 可能在组件被卸载之后仍在执行, 所以需要加一个 flag)
      if (!isUnloaded) {
        const curWindowSize = getWindowSize(type)
        // window size 缓存到 defaultSize 中
        // 以供其他组件使用(其他组件默认就可以取到正确的 size)
        defaultSize[`${type}Width`] = curWindowSize.width
        defaultSize[`${type}Height`] = curWindowSize.height
        setSize({
          ...curWindowSize,
        })
      }
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
    document.addEventListener('fullscreenchange', onResize)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      isUnloaded = true
      window.removeEventListener('resize', onResize)
      document.removeEventListener('fullscreenchange', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [type])

  return size
}

/**
 * - portrait: 竖屏
 * - landscape: 横屏
 */
export type WindowOrientation = 'portrait' | 'landscape'

/**
 * 基于设备尺寸返回横屏 or 竖屏
 * - portrait: 竖屏
 * - landscape: 横屏
 */
export function getWindowOrientation(): WindowOrientation {
  const windowSize = getWindowSize('inner')
  return windowSize.width <= windowSize.height ? 'portrait' : 'landscape'
}

/**
 * 基于设备尺寸返回横屏 or 竖屏
 * - portrait: 竖屏
 * - landscape: 横屏
 */
export function useWindowOrientation(): WindowOrientation {
  const windowSize = useWindowSize('inner')
  return windowSize.width <= windowSize.height ? 'portrait' : 'landscape'
}
