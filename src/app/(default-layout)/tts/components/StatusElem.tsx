import { assertNever } from '@/utils/function'

import { Typography } from '@mui/material'

import type { TtsStatus } from '@/generated-prisma-client'

export function StatusElem({ status }: { status: TtsStatus }) {
  switch (status) {
    case 'SUCCESS':
      return (
        <Typography component='span' color='success.main'>
          成功
        </Typography>
      )
    case 'FAILED':
      return (
        <Typography component='span' color='error.main'>
          失败
        </Typography>
      )
    case 'PENDING':
      return (
        <Typography component='span' color='info.main'>
          等待中...
        </Typography>
      )
    case 'PROCESSING':
      return (
        <Typography component='span' color='primary.main'>
          处理中...
        </Typography>
      )
    default:
      assertNever(status)
      return (
        <Typography component='span' color='text.secondary'>
          未知状态
        </Typography>
      )
  }
}
