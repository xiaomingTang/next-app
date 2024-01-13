import { EmptyErrorFallback } from './EmptyErrorFallback'
import { GlobalStyles } from './GlobalStyles'
import { ToastContext } from './ToastContext'

import { GlobalAudioPlayer } from '@/components/GlobalAudioPlayer'
import { LyricsViewer } from '@/components/LyricsViewer'
import { useUser } from '@/user'
import Polyfills from '@/globals/polyfills'

import { ErrorBoundary } from 'next/dist/client/components/error-boundary'

/**
 * 全局业务 hook
 */
function BusinessHooks() {
  useUser.useInit()
  return <></>
}

/**
 * 全局基础组件
 */
function BaseComponents() {
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
function BusinessComponents() {
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
        <BusinessHooks />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <BaseComponents />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <BusinessComponents />
      </ErrorBoundary>
    </>
  )
}
