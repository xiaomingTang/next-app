import { useListen } from './useListen'

import { IndexManager } from '@/utils/IndexManager'

import { useEventCallback } from '@mui/material'
import { useRef } from 'react'
import { useEvent } from 'react-use'

let ignoreIdx = -1
// 这个 manager 既非 stack, 也非 queue,
// 叫 stack 只是随便叫的
const stack = new IndexManager()

/**
 * 该 hook 可用于任何需要物理返回键的地方;
 * 注释中的所有 modal 或 弹窗 都不仅限于 "弹窗",
 * 任何需要的地方都可以用,
 * 如 Dropdown/Drawer/Tooltip 等, 任何有 visible change 的地方都可以用;
 * (其实没有 visible change 的地方也可以用, 毕竟该 hook 只负责管理 history, 不干涉 ui)
 */
export function useInjectHistory(
  open: boolean,
  /**
   * 如果需要在用户物理返回时关闭弹窗, 就在该方法中手动调用 modal.hide();
   * 如果拒绝关闭弹窗, 就别 hide() 并 throw Error;
   */
  onPopState: (e: PopStateEvent) => void | Promise<void>
) {
  // 弹窗维护各自的 index
  const IndexRef = useRef(-1)

  const finalOnPopState = useEventCallback(async (e: PopStateEvent) => {
    // 轮到我了吗? 没轮到就返回
    if (IndexRef.current !== stack.latest) {
      return
    }
    // 是上一个弹窗关闭而触发的 popstate 吗? 是就返回;
    // (并且把 ignoreIdx 标志位清掉, 使得下次 popstate 能正常生效)
    if (IndexRef.current === ignoreIdx) {
      ignoreIdx = -1
      return
    }
    // 必须要立即 drop 掉
    stack.drop(IndexRef.current)
    try {
      await onPopState(e)
    } catch (error) {
      // 抛错时, 恢复 stack
      stack.push(IndexRef.current)
      window.history.pushState(null, '', window.location.href)
    }
  })

  useEvent('popstate', finalOnPopState)

  useListen(!!open, () => {
    if (open) {
      // modal index 初始化
      IndexRef.current = stack.latest + 1
      stack.push(IndexRef.current)
      window.history.pushState(null, '', window.location.href)
    } else {
      if (stack.has(IndexRef.current)) {
        // stack 内有该 modal index, 说明是其他地方手动调用 modal.hide, 而非物理返回所触发
        stack.drop(IndexRef.current)
        // 此时需要先清理 stack, 然后根据新 stack 设置标志位
        ignoreIdx = stack.latest
        // 设置标志位是为了避免下一个 modal 被此处触发的 popstate 关闭
        window.history.back()
      }
      // 不管怎么样, modal close 的时候都需要还原该 modal index
      IndexRef.current = -1
    }
  })
}
