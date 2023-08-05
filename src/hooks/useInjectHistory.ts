import { useListen } from './useListen'

import { useEventCallback } from '@mui/material'
import { useRef } from 'react'
import { useEvent } from 'react-use'

import type { NiceModalHandler } from '@ebay/nice-modal-react'

let modalLevels: number[] = []
let ignoreLevel = -1

export function useInjectHistory(
  modal: NiceModalHandler<Record<string, unknown>>,
  /**
   * 如果需要在用户物理返回时关闭弹窗, 就在该方法中手动调用 modal.hide();
   * 如果拒绝关闭弹窗, 就别 hide() 并 throw Error;
   */
  onPopState: (e: PopStateEvent) => Promise<void>
) {
  const levelRef = useRef(-1)
  const finalOnPopState = useEventCallback((e: PopStateEvent) => {
    if (levelRef.current !== Math.max(...modalLevels, 0)) {
      return
    }
    if (levelRef.current === ignoreLevel) {
      ignoreLevel = -1
      return
    }
    modalLevels = modalLevels.filter((v) => v !== levelRef.current)
    onPopState(e).catch(() => {
      modalLevels.push(levelRef.current)
      window.history.pushState(null, '', window.location.href)
    })
  })
  useEvent('popstate', finalOnPopState)
  useListen(modal.visible, () => {
    if (modal.visible) {
      levelRef.current = Math.max(...modalLevels, 0) + 1
      modalLevels.push(levelRef.current)
      window.history.pushState(null, '', window.location.href)
    } else if (modalLevels.includes(levelRef.current)) {
      modalLevels = modalLevels.filter((v) => v !== levelRef.current)
      ignoreLevel = levelRef.current - 1
      window.history.back()
    }
  })
}
