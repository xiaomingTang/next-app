import { InfiniteTimeout } from '@/constants'

import { clamp } from 'lodash-es'

export async function sleepMs(ms: number): Promise<void> {
  if (Number.isNaN(ms)) {
    throw new Error('invalid input: NaN')
  }
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve()
      },
      clamp(ms, 0, InfiniteTimeout)
    )
  })
}

/**
 * 返回当地时间当天 0 点
 * （如果在服务端，服务器部署在中国国内，则是北京时间 当天 0 点）
 */
export function getLocalStartsOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}
