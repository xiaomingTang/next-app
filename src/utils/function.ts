import { sleepMs } from './time'

import { ENV_CONFIG } from '@/config'

import type EventEmitter from 'eventemitter3'

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

export function exclusiveCallbacks<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  EE extends EventEmitter<any, any>,
  Tuple = Parameters<EE['on']>,
>(emitter: EE, callbackMap: Tuple[]) {
  const storedCallbackMap = [] as Tuple[]
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  callbackMap.forEach(([event, callback]) => {
    const onEvent = (...args: unknown[]) => {
      callback(...args)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      storedCallbackMap.forEach(([e, c]) => {
        emitter.off(e, c)
      })
      storedCallbackMap.length = 0
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    storedCallbackMap.push([event, onEvent] as any)
    emitter.on(event, onEvent)
  })
}
