import { sleepMs } from './time'

import { ENV_CONFIG } from '@/config'

export type Func<Args extends unknown[] = unknown[], T = unknown> = (
  ...args: Args
) => T

export function loopCall(callback: Func<[], unknown>): Func<[], void> {
  let stopLoop = false

  async function loop() {
    while (!stopLoop) {
      await callback()
      // 必须 sleep 0, 防止 callback 是同步函数, 导致卡死事件循环
      await sleepMs(0)
    }
  }

  // 启动循环
  void loop()

  // 返回的函数用于停止循环
  return () => {
    stopLoop = true
  }
}

export function assertNever(val: never) {
  if (typeof val === 'undefined') {
    return
  }
  if (ENV_CONFIG.public.nodeEnv !== 'production') {
    throw new Error(`restrict not satisfied: assert never, got ${typeof val}`)
  }
  console.error(`restrict not satisfied: assert never, got ${typeof val}:`, val)
}

export function uniqueFunc<Args extends unknown[], Ret>(
  func: Func<Args, Ret>
): Func<Args, Ret> {
  return (...args: Args) => func(...args)
}
