'use client'

import { upload } from '@D/upload/components/Uploader'
import { useUser } from '@/user'

import { noop } from 'lodash-es'
import { useEffect } from 'react'

export function FilePasteCatcher() {
  const user = useUser()
  useEffect(() => {
    if (!user.id) {
      return noop
    }
    const onPaste = (e: ClipboardEvent) => {
      // 需要把文件夹过滤掉 (文件夹没有 type)
      const files = Array.from(e.clipboardData?.files ?? []).filter(
        (f) => f.size > 0
      )
      if (files.length > 0) {
        upload(files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => {
      window.removeEventListener('paste', onPaste)
    }
  }, [user.id])

  return <></>
}
