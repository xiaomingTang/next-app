import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'

const useRawProjectPath = create(() => ({
  rootHash: '',
  path: '',
}))

export const useProjectPath = withStatic(useRawProjectPath, {
  setRootHash(newRootHash: string) {
    useRawProjectPath.setState({ rootHash: newRootHash })
  },
  replace(newPath: string) {
    const { rootHash } = useRawProjectPath.getState()
    if (!rootHash) {
      throw new Error('Root hash not found')
    }
    useRawProjectPath.setState({ path: newPath })
    window.history.replaceState(null, '', `/project/${rootHash}${newPath}`)
  },
  push(newPath: string) {
    const { rootHash } = useRawProjectPath.getState()
    if (!rootHash) {
      throw new Error('Root hash not found')
    }
    useRawProjectPath.setState({ path: newPath })
    window.history.pushState(null, '', `/project/${rootHash}${newPath}`)
  },
})
