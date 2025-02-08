import { noop } from 'lodash-es'
import { useEffect } from 'react'

export function useBeforeUnload(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return noop
    }
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      return 'before unload'
    }
    window.addEventListener('beforeunload', handler)
    return () => {
      window.removeEventListener('beforeunload', handler)
    }
  }, [enabled])
}
