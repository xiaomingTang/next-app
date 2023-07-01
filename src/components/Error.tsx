'use client'

import { Alert } from '@mui/material'

import type { PlainError } from '@/errors/utils'

export function Error({ message }: PlainError) {
  return <Alert severity='error'>{message}</Alert>
}
