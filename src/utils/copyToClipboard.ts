import 'client-only'

import { toError } from '@/errors/utils'

import toast from 'react-hot-toast'

export async function copyToClipboard(text: string) {
  try {
    if (!navigator.clipboard) {
      throw new Error('navigator.clipboard is not available')
    }

    await navigator.clipboard.writeText(text)
  } catch (e) {
    const err = toError(e)
    toast.error(`复制失败: ${err.message}`)
    throw e
  }
  toast.success('复制成功')
}
