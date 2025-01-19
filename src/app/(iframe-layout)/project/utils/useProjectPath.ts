import { withStatic } from '@/utils/withStatic'

import { useEffect } from 'react'
import { create } from 'zustand'

const useRawProjectPath = create(() => ({
  rootHash: '',
  path: '',
}))

function formatPath(p: string | string[]) {
  if (!p) {
    return '/'
  }
  if (Array.isArray(p)) {
    if (p.length === 0) {
      return '/'
    }
    return `/${p.join('/')}`
  }
  return p
}

interface UseBeforePathChangedCallback {
  (newPath: string, prevPath: string): boolean | void | Promise<boolean | void>
}

export const useProjectPath = withStatic(useRawProjectPath, {
  _initialed: false,
  _callbacks: [] as UseBeforePathChangedCallback[],
  init({ rootHash, path }: { rootHash: string; path: string | string[] }) {
    if (useProjectPath._initialed) {
      return
    }
    useProjectPath._initialed = true
    useRawProjectPath.setState({
      rootHash,
      path: formatPath(path),
    })
  },
  async replace(newPath: string | string[]) {
    const { rootHash, path: prevPath } = useRawProjectPath.getState()
    if (!rootHash) {
      throw new Error('Root hash not found')
    }
    const p = formatPath(newPath)
    if (p === prevPath) {
      return
    }
    const res = await Promise.all(
      useProjectPath._callbacks.map(async (c) => c(p, prevPath))
    )
    if (res.some((r) => r === false)) {
      return
    }
    useRawProjectPath.setState({ path: p })
    window.history.replaceState(null, '', `/project/${rootHash}${p}`)
  },
  push(newPath: string | string[]) {
    const { rootHash, path: prevPath } = useRawProjectPath.getState()
    if (!rootHash) {
      throw new Error('Root hash not found')
    }
    const p = formatPath(newPath)
    if (p === prevPath) {
      return
    }
    if (useProjectPath._callbacks.some((c) => c(p, prevPath) === false)) {
      return
    }
    useRawProjectPath.setState({ path: p })
    window.history.pushState(null, '', `/project/${rootHash}${p}`)
  },
  /**
   * @param callback 返回 false 可以阻止路径变化
   */
  useBeforePathChanged(
    callback: UseBeforePathChangedCallback,
    deps: unknown[]
  ) {
    useEffect(() => {
      useProjectPath._callbacks.push(callback)

      return () => {
        useProjectPath._callbacks = useProjectPath._callbacks.filter(
          (c) => c !== callback
        )
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
  },
})
