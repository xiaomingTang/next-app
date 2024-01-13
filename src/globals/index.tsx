import { EmptyErrorFallback } from './EmptyErrorFallback'
import { GlobalStyles } from './GlobalStyles'
import { ToastContext } from './ToastContext'
import { GlobalBusinessHooks } from './GlobalBusinessHooks'

import { GlobalAudioPlayer } from '@/components/GlobalAudioPlayer'
import { LyricsViewer } from '@/components/LyricsViewer'
import Polyfills from '@/globals/polyfills'

import { ErrorBoundary } from 'next/dist/client/components/error-boundary'

/**
 * 全局基础组件
 */
function GlobalBaseComponents() {
  return (
    <>
      <GlobalStyles />
      <Polyfills />
      <ToastContext />
    </>
  )
}

/**
 * 全局业务组件
 */
function GlobalBusinessComponents() {
  return (
    <>
      <GlobalAudioPlayer />
      <LyricsViewer />
    </>
  )
}

export function Globals() {
  return (
    <>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <GlobalBusinessHooks />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <GlobalBaseComponents />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <GlobalBusinessComponents />
      </ErrorBoundary>
    </>
  )
}
