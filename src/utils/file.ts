import { ENV_CONFIG } from '@/config'

import { useEffect, useState } from 'react'

/**
 * 使用 FileReader
 */
export async function file2DataURL(f: Blob) {
  if (!(f instanceof Blob)) {
    if (ENV_CONFIG.public.nodeEnv === 'production') {
      console.error('file2DataURL: 参数错误，不是 Blob: ', f)
    } else {
      throw new Error('file2DataURL: 参数错误，不是 Blob')
    }
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    const unbindEvents = () => {
      reader.onerror = null
      reader.onabort = null
      reader.onload = null
    }

    const onError = () => {
      unbindEvents()
      reject(new Error('文件转 DataURL 失败'))
    }

    reader.readAsDataURL(f)
    reader.onerror = onError
    reader.onabort = onError

    reader.onload = () => {
      unbindEvents()
      resolve(reader.result as string)
    }
  })
}

/**
 * 使用 URL.createObjectURL
 */
export function useFile2URL(f?: Blob) {
  const [url, setUrl] = useState(() => (f ? URL.createObjectURL(f) : ''))

  useEffect(() => {
    const newUrl = f ? URL.createObjectURL(f) : ''
    setUrl(newUrl)

    return () => {
      URL.revokeObjectURL(newUrl)
    }
  }, [f])

  return url
}
