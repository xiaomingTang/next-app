/* eslint-disable @typescript-eslint/no-explicit-any */
import { ENV_CONFIG } from '@/config'

interface StaticFuncs {
  [key: string]: (...args: any[]) => any
}

export function withStatic<T extends object, S extends StaticFuncs>(
  useStore: T,
  staticFuncs: S
) {
  const isDev = ENV_CONFIG.public.nodeEnv !== 'production'
  const result = useStore as T & S
  Object.keys(staticFuncs).forEach((key) => {
    if (key in useStore) {
      if (isDev) {
        throw new Error(`protected key: ${key}`)
      } else {
        console.error(`protected key: ${key}`)
      }
      return
    }
    // @ts-expect-error 将 staticFuncs key 赋给 result
    result[key] = staticFuncs[key]
  })
  return result
}
