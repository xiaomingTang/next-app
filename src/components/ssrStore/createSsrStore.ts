import { withStatic } from '@/utils/withStatic'

import { isEqual } from 'lodash-es'
import { useEffect } from 'react'
import { create } from 'zustand'

import type { DecodedStorage } from './createJsonStorage'

function selectSelf<T>(state: T) {
  return state
}

type Selector<S, P> = (state: S) => P

interface SsrStorageOptions<T> {
  name: string
  storage: DecodedStorage<Partial<T>>
}

export function createSsrStore<C>(
  initializer: () => C,
  options: SsrStorageOptions<C>
) {
  const useRawStore = create(initializer)
  let initialized = false

  function useInit() {
    useEffect(() => {
      if (initialized) {
        return
      }
      initialized = true
      useRawStore.setState(options.storage.getItem(options.name) ?? {})

      // hydrate 之后再监听
      // 避免 store 初始化的时候 state 改变也触发 storage setItem
      useRawStore.subscribe((state, prev) => {
        if (prev === null || isEqual(state, prev)) {
          return
        }
        options.storage.setItem(options.name, state)
      })
    }, [])
  }

  function useStore<P = C>(selector?: Selector<C, P>) {
    useInit()
    return useRawStore(selector ?? (selectSelf as Selector<C, P>))
  }

  return withStatic(useStore, {
    getState: useRawStore.getState,
    setState: useRawStore.setState,
    subscribe: useRawStore.subscribe,
  })
}
