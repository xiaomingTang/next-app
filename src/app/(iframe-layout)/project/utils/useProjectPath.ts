import { withStatic } from '@/utils/withStatic'

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

export const useProjectPath = withStatic(useRawProjectPath, {
  setRootHash(newRootHash: string) {
    useRawProjectPath.setState({ rootHash: newRootHash })
  },
  replace(newPath: string | string[]) {
    const { rootHash } = useRawProjectPath.getState()
    if (!rootHash) {
      throw new Error('Root hash not found')
    }
    const p = formatPath(newPath)
    useRawProjectPath.setState({ path: p })
    window.history.replaceState(null, '', `/project/${rootHash}${p}`)
  },
  push(newPath: string | string[]) {
    const { rootHash } = useRawProjectPath.getState()
    if (!rootHash) {
      throw new Error('Root hash not found')
    }
    const p = formatPath(newPath)
    useRawProjectPath.setState({ path: p })
    window.history.pushState(null, '', `/project/${rootHash}${p}`)
  },
})
