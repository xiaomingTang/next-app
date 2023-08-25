'use client'

import { sleepMs } from '@/utils/time'

interface UserVideoProps {
  /**
   * - environment: 后置摄像头
   * - user: 前置摄像头
   * @default 'environment'
   */
  preferFacingMode?: 'environment' | 'user'
  /**
   * 由于用户可以不选择, 避免 Promise 挂起, 所以需要超时
   * @default 30000
   */
  timeoutMs?: number
}

export async function getUserVideo({
  preferFacingMode = 'environment',
  timeoutMs = 30000,
}: UserVideoProps = {}) {
  const stream = await Promise.race([
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: preferFacingMode,
      },
    }),
    sleepMs(timeoutMs),
  ])
  if (!stream) {
    throw new Error('相机权限访问超时')
  }
  return stream
}
