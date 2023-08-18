import { useListen } from './useListen'

import { IndexManager } from '@/utils/IndexManager'

import { useEventCallback } from '@mui/material'
import { useRef } from 'react'
import { useEvent } from 'react-use'

let ignoreIdx = -1
// 这个 manager 既非 stack, 也非 queue,
// 叫 stack 只是随便叫的
const stack = new IndexManager()

export function useInjectHistory(
  open: boolean,
  /**
   * 如果需要在用户物理返回时关闭弹窗, 就在该方法中手动调用 modal.hide();
   * 如果拒绝关闭弹窗, 就别 hide() 并 throw Error;
   */
  onPopState: (e: PopStateEvent) => Promise<void>
) {
  // 弹窗维护各自的 index
  const modalIdxRef = useRef(-1)

  const finalOnPopState = useEventCallback((e: PopStateEvent) => {
    // 轮到我了吗? 没轮到就返回
    if (modalIdxRef.current !== stack.latest) {
      return
    }
    // 是上一个弹窗关闭而触发的 popstate 吗? 是就返回;
    // (并且把 ignoreIdx 标志位清掉, 使得下次 popstate 能正常生效)
    if (modalIdxRef.current === ignoreIdx) {
      ignoreIdx = -1
      return
    }
    stack.drop(modalIdxRef.current)
    onPopState(e).catch(() => {
      // 抛错时, 恢复 stack
      stack.push(modalIdxRef.current)
      window.history.pushState(null, '', window.location.href)
    })
  })

  useEvent('popstate', finalOnPopState)

  useListen(!!open, () => {
    if (open) {
      // modal index 初始化
      modalIdxRef.current = stack.latest + 1
      stack.push(modalIdxRef.current)
      window.history.pushState(null, '', window.location.href)
    } else if (stack.has(modalIdxRef.current)) {
      // 站内有该 modal index, 说明是其他地方手动调用 modal.hide, 而非物理返回所触发
      stack.drop(modalIdxRef.current)
      // 此时需要先清理 stack, 然后根据新 stack 设置标志位
      ignoreIdx = stack.latest
      // 设置标志位是为了避免下一个 modal 被此处触发的 popstate 关闭
      window.history.back()
    }
  })
}
