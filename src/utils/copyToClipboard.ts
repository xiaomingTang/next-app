import 'client-only'

import { toError } from '@/errors/utils'

import toast from 'react-hot-toast'

export async function copyToClipboard(
  text: string,
  feedback: 'silently' | 'withFeedback' = 'withFeedback'
) {
  try {
    if (!navigator.clipboard) {
      throw new Error('当前浏览器不支持复制功能')
    }

    await navigator.clipboard.writeText(text)
  } catch (e) {
    const err = toError(e)
    if (feedback === 'withFeedback') {
      toast.error(`复制失败: ${err.message}`)
    }
    throw e
  }
  if (feedback === 'withFeedback') {
    toast.success('复制成功')
  }
}
