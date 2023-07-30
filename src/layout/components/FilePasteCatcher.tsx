'use client'

import { upload } from '@/app/upload/components/Uploader'

import { useEffect } from 'react'

export function FilePasteCatcher() {
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? [])
      if (files.length > 0) {
        upload(files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('paste', onPaste)
    }
  }, [])

  return <></>
}
