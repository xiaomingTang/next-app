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

const G_SIZE = 1024 * 1024 * 1024
const M_SIZE = 1024 * 1024
const K_SIZE = 1024

export function friendlySize(size: number) {
  // > 10G: 如 23.356G: 显示 23G
  if (size > G_SIZE * 10) {
    const g = Math.round(size / G_SIZE)
    return `${g}G`
  }
  // 1 ~ 10G: 如 5.356G: 显示 5.4G
  if (size > G_SIZE) {
    const g = (size / G_SIZE).toFixed(1)
    return `${g}G`
  }
  // > 10M: 如 23.356M: 显示 23M
  if (size > M_SIZE * 10) {
    const m = Math.round(size / M_SIZE)
    return `${m}M`
  }
  // 1 ~ 10M: 如 5.356M: 显示 5.4M
  if (size > M_SIZE) {
    const m = (size / M_SIZE).toFixed(1)
    return `${m}M`
  }
  // > 10K: 如 23.356K: 显示 23K
  if (size > 10 * K_SIZE) {
    const k = Math.round(size / K_SIZE)
    return `${k}K`
  }
  // > 1K: 如 5.356K: 显示 5.4K
  if (size > K_SIZE) {
    const k = (size / K_SIZE).toFixed(1)
    return `${k}K`
  }
  // <= 1K: 例: 显示 543B
  return `${size}B`
}
