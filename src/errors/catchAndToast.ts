'use client'

import { toError } from './utils'

import { useUser } from '@/user'

import { toast } from 'react-hot-toast'
import { noop } from 'lodash-es'

import type { Func } from './utils'

type AwaitedValue<T> = T extends Promise<infer S> ? S : T

interface CatProps {
  doNotShowLoginModalWhen401?: boolean
}

/**
 * catch and toast
 */
export function cat<Args extends unknown[], Ret>(
  callback: Func<Args, Ret>,
  props?: CatProps
): Func<Args, Promise<AwaitedValue<Ret> | undefined>> {
  return async (...args) => {
    try {
      const ret = (await callback(...args)) as AwaitedValue<Ret>
      return ret
    } catch (catchError) {
      const error = toError(catchError)
      if (error.code === 401) {
        // 401 直接清空用户态
        useUser.reset()
        if (props?.doNotShowLoginModalWhen401 !== true) {
          // 不关心完成与否, 所以无需 await
          useUser.login().catch(noop)
        }
      }
      toast.error(error.message ?? '服务器错误，请稍后再试')
      return undefined
    }
  }
}
