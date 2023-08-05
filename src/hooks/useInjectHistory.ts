import { useListen } from './useListen'

import { useEventCallback } from '@mui/material'
import { useRef } from 'react'
import { useEvent } from 'react-use'

import type { NiceModalHandler } from '@ebay/nice-modal-react'

export function useInjectHistory(
  modal: NiceModalHandler<Record<string, unknown>>,
  /**
   * 如果需要在用户物理返回时关闭弹窗, 就在该方法中手动调用 modal.hide();
   * 如果拒绝关闭弹窗, 就别 hide() 并 throw Error;
   */
  onPopState: (e: PopStateEvent) => Promise<void>
) {
  const isTriggeredByPopStateRef = useRef(false)
  const finalOnPopState = useEventCallback((e: PopStateEvent) => {
    isTriggeredByPopStateRef.current = true
    onPopState(e).catch(() => {
      window.history.pushState(null, '', '#dialog')
    })
  })
  useEvent('popstate', finalOnPopState)
  useListen(modal.visible, () => {
    if (modal.visible) {
      window.history.pushState(null, '', '#dialog')
    } else if (!isTriggeredByPopStateRef.current) {
      window.history.back()
    }
  })
}
