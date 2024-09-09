'use client'

import { EmptyErrorFallback } from './EmptyErrorFallback'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'

const GlobalAudioPlayer = dynamic(
  () =>
    import('@/components/GlobalAudioPlayerImports').then(
      (res) => res.GlobalAudioPlayer
    ),
  { ssr: false }
)
const LyricsViewer = dynamic(
  () => import('@/components/LyricsViewer').then((res) => res.LyricsViewer),
  { ssr: false }
)

export function GlobalDynamicComponents() {
  return (
    <>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <GlobalAudioPlayer />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <LyricsViewer />
      </ErrorBoundary>
    </>
  )
}
