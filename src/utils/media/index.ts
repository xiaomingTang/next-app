'use client'

import { sleepMs } from '@/utils/time'

const defaultMediaStreamConstraints: MediaStreamConstraints = {
  video: {
    facingMode: 'environment',
  },
}

export async function getUserMedia(
  constraints: MediaStreamConstraints = defaultMediaStreamConstraints,
  /**
   * 由于用户可以不选择, 避免 Promise 挂起, 所以需要超时
   * @default 30000
   */
  timeoutMs = 30000
) {
  // 处于不安全上下文时, navigator.mediaDevices 为空
  if (!(navigator.mediaDevices?.getUserMedia instanceof Function)) {
    throw new Error('没找到相机')
  }
  const stream = await Promise.race([
    navigator.mediaDevices.getUserMedia(constraints),
    sleepMs(timeoutMs),
  ])
  if (!stream) {
    throw new Error('相机权限访问超时')
  }
  return stream
}
