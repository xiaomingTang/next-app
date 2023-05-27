/* eslint-disable @typescript-eslint/no-explicit-any */
import { ENV_CONFIG } from '@/config'

import type { StoreApi, UseBoundStore } from 'zustand'

interface StaticFuncs {
  [key: string]: (...args: any[]) => any
}

type WithStatic<
  T extends UseBoundStore<StoreApi<any>>,
  S extends StaticFuncs
> = T & S

export function withStatic<T, S extends StaticFuncs>(
  useStore: UseBoundStore<StoreApi<T>>,
  staticFuncs: S
) {
  const protectedKeys = Object.keys(useStore)
  const isDev = ENV_CONFIG.public.nodeEnv !== 'production'
  const result = useStore as WithStatic<UseBoundStore<StoreApi<T>>, S>
  Object.keys(staticFuncs).forEach((key) => {
    if (protectedKeys.includes(key)) {
      if (isDev) {
        throw new Error(`protected key: ${key}`)
      } else {
        console.error(`protected key: ${key}`)
      }
      return
    }
    result[key as 'setState'] = staticFuncs[key]
  })
  return result
}
