'use client'

import { DefaultRawHeader } from './DefaultHeader'

/**
 * you should import FullscreenLayout.css in page.tsx
 */
export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <>
      <DefaultRawHeader />
      {children}
    </>
  )
}
