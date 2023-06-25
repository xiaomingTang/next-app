'use client'

import { toError } from './utils'

import { toast } from 'react-hot-toast'

import type { Func } from './utils'

type AwaitedValue<T> = T extends Promise<infer S> ? S : T

/**
 * catch and toast
 */
export function cat<Args extends unknown[], Ret>(
  callback: Func<Args, Ret>
): Func<Args, Promise<AwaitedValue<Ret> | undefined>> {
  return async (...args) => {
    try {
      const ret = (await callback(...args)) as AwaitedValue<Ret>
      return ret
    } catch (catchError) {
      const error = toError(catchError)
      toast.error(error.message ?? '服务器错误，请稍后再试')
      return undefined
    }
  }
}
