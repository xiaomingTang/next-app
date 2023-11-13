import { geneFileKey } from './geneFileKey'

import { useEffect, useRef, useState } from 'react'
import { noop } from 'lodash-es'

export function useFileUrl(blob: Blob, enabled = true) {
  const key = geneFileKey(blob)
  const blobRef = useRef(blob)
  blobRef.current = blob
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!blobRef.current) {
      return noop
    }
    if (!enabled) {
      setUrl('')
      return noop
    }
    const tempUrl = URL.createObjectURL(blobRef.current)
    setUrl(tempUrl)
    return () => {
      URL.revokeObjectURL(tempUrl)
    }
  }, [key, enabled])

  return url
}
