import { EmptyErrorFallback } from './EmptyErrorFallback'
import { GlobalStyles } from './GlobalStyles'
import { ToastContext } from './ToastContext'
import { GlobalBusinessHooks } from './GlobalBusinessHooks'
import { DynamicImportSeeds } from './DynamicImport'
import { GlobalDynamicComponents } from './GlobalDynamicImports'

import Polyfills from '@/globals/polyfills'

import { ErrorBoundary } from 'next/dist/client/components/error-boundary'

export function Globals() {
  return (
    <>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <GlobalBusinessHooks />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <GlobalStyles />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <Polyfills />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <ToastContext />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <DynamicImportSeeds />
      </ErrorBoundary>
      <ErrorBoundary errorComponent={EmptyErrorFallback}>
        <GlobalDynamicComponents />
      </ErrorBoundary>
    </>
  )
}
