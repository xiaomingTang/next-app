'use client'

// Error components must be Client Components

import Anchor from '@/components/Anchor'
import { toPlainError } from '@/errors/utils'

import { Alert, Typography } from '@mui/material'

export default function ErrorPage({
  error: rawError,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const error = toPlainError(rawError)

  return (
    <>
      <Typography
        variant='h5'
        sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}
      >
        TTS 任务详情
      </Typography>
      <Alert severity='error'>
        <Typography sx={{ mb: 1 }}>{error.message}</Typography>
        <Typography>
          <Typography component='span'>{'你还可以 '}</Typography>
          <Anchor href='/tts/tasks'>返回任务列表</Anchor>
          {' 或者 '}
          <Anchor href='/tts'>再新建一个任务</Anchor>
        </Typography>
      </Alert>
    </>
  )
}
