'use client'

// Error components must be Client Components

import { AlertError } from '@/components/Error'
import { toPlainError } from '@/errors/utils'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'

import { useEffect } from 'react'

export default function ErrorPage({
  error: rawError,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const error = toPlainError(rawError)

  useEffect(() => {
    // TODO: Log the error to an error reporting service
    console.error(rawError)
  }, [rawError])

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <AlertError {...error} />
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
