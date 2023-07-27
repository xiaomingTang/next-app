import { InfiniteTimeout } from '@/constants'

import { clamp } from 'lodash-es'

export async function sleepMs(ms: number): Promise<void> {
  if (Number.isNaN(ms)) {
    throw new Error('invalid input: NaN')
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, clamp(ms, 0, InfiniteTimeout))
  })
}
