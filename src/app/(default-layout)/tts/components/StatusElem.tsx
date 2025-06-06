import { assertNever } from '@/utils/function'
import Span from '@/components/Span'

import type { TtsStatus } from '@/generated-prisma-client'

export function StatusElem({ status }: { status: TtsStatus }) {
  switch (status) {
    case 'SUCCESS':
      return <Span color='success.main'>成功</Span>
    case 'FAILED':
      return <Span color='error.main'>失败</Span>
    case 'PENDING':
      return <Span color='info.main'>等待中...</Span>
    case 'PROCESSING':
      return <Span color='primary.main'>处理中...</Span>
    default:
      assertNever(status)
      return <Span color='text.secondary'>未知状态</Span>
  }
}
