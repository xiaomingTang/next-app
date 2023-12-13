'use client'

// Error components must be Client Components

import { GA } from '@/analytics/GA'
import Contexts from '@/common/contexts'
import Polyfills from '@/common/polyfills'
import Providers from '@/common/providers'
import { ServerProvider } from '@/common/providers/ServerProvider'
import { AlertError } from '@/components/Error'
import { GetInitColorSchemeScript } from '@/components/GetColorScheme'
import { GlobalAudioPlayer } from '@/components/GlobalAudioPlayer'
import { LyricsViewer } from '@/components/LyricsViewer'
import { VConsole } from '@/components/VConsole'
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
    <html lang='zh-cn' suppressHydrationWarning>
      <body>
        <VConsole />
        <GetInitColorSchemeScript />
        <Providers>
          <ServerProvider>
            <GlobalAudioPlayer />
            <LyricsViewer />
            <Polyfills />
            <Contexts />
            <DefaultLayout>
              <DefaultBodyContainer>
                <GA />
                <AlertError {...error} />
              </DefaultBodyContainer>
            </DefaultLayout>
          </ServerProvider>
        </Providers>
      </body>
    </html>
  )
}
