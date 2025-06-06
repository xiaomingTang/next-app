'use client'

// Error components must be Client Components

import Anchor from '@/components/Anchor'
import { toPlainError } from '@/errors/utils'
import Span from '@/components/Span'

import { Alert, Typography } from '@mui/material'

import type { PlainError } from '@/errors/utils'

export default function ErrorPage({
  error: rawError,
}: {
  error: PlainError | Error
}) {
  const error = toPlainError(rawError)

  return (
    <Alert severity='error'>
      <Typography sx={{ mb: 1 }}>{error.message}</Typography>
      <Typography>
        <Span>{'你还可以 '}</Span>
        <Anchor href='/tts/tasks'>返回任务列表</Anchor>
        {' 或者 '}
        <Anchor href='/tts'>再新建一个任务</Anchor>
      </Typography>
    </Alert>
  )
}
