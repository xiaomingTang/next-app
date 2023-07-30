'use client'

import { upload } from '@/app/upload/components/Uploader'

import { useEffect } from 'react'

export function FilePasteCatcher() {
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      // 需要把文件夹过滤掉 (文件夹没有 type)
      const files = Array.from(e.clipboardData?.files ?? []).filter(
        (f) => !!f.type
      )
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
