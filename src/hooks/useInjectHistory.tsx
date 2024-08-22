import { useListen } from './useListen'

import { useEventCallback } from '@mui/material'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { useEvent } from 'react-use'

class stack {
  static list: number[] = []

  static get latest() {
    return Math.max(...this.list, 0)
  }

  static push() {
    const latest = this.latest + 1
    this.list.push(latest)
    window.history.pushState(null, '', window.location.href)
    return latest
  }

  static drop(n: number) {
    this.list = this.list.filter((i) => i !== n)
  }

  static locked = false

  static invalidStackIndex = 0
}

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
   * 如果需要在用户物理返回时关闭弹窗, 就在该方法中手动调用 void modal.hide();
   * 如果拒绝关闭弹窗, 就别 hide() 并 throw Error;
   * !!! 如果不 hide(), 就必须 throw Error;
   */
  onPopState: (e: PopStateEvent) => void | Promise<void>
) {
  // 弹窗维护各自的 index
  const IndexRef = useRef(0)
  const pathname = usePathname()

  useListen(pathname, (_, prev) => {
    if (prev) {
      stack.invalidStackIndex = stack.latest
    }
  })

  const finalOnPopState = useEventCallback(async (e: PopStateEvent) => {
    // 未初始化
    if (IndexRef.current <= 0) {
      return
    }
    // 轮到我了吗? 没轮到就返回
    if (IndexRef.current !== stack.latest) {
      return
    }
    // 我是最新的, 我就得负责解锁 (不管我自己关没关掉)
    if (stack.locked) {
      stack.locked = false
      return
    }
    // 不关我的事, 我已经关掉了
    if (!open) {
      return
    }
    stack.locked = true
    try {
      await onPopState(e)
    } catch (error) {
      // 不让关闭, 还原所有状态
      stack.locked = false
      IndexRef.current = stack.push()
    }
  })

  useEvent('popstate', finalOnPopState)

  useListen(open, () => {
    if (open) {
      // 初始化
      IndexRef.current = stack.push()
      return
    }
    // 未初始化
    if (IndexRef.current <= 0) {
      return
    }
    const tempIndex = IndexRef.current
    stack.drop(IndexRef.current)
    IndexRef.current = 0
    if (stack.locked) {
      window.setTimeout(() => {
        /**
         * 帮下一个解锁, 不能太快, 否则在一些场景下会出现:
         * 自己刚刚被 popstate 关闭, 随后触发 open 变化,
         * 自己把自己的锁给解了
         */
        stack.locked = false
      }, 0)
      return
    }
    if (tempIndex > stack.invalidStackIndex) {
      if (stack.invalidStackIndex > 0) {
        stack.locked = true
      }
      window.history.back()
    }
  })
}
