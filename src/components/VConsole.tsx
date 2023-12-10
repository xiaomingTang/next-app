/* eslint-disable @next/next/no-sync-scripts */

import Script from 'next/script'

export function VConsole({ enabled = false }: { enabled?: boolean }) {
  if (enabled) {
    return (
      <>
        <script src='/scripts/vconsole.min.js' />
        <Script
          id='vconsole'
          dangerouslySetInnerHTML={{
            __html: 'new VConsole()',
          }}
        />
      </>
    )
  }
  return <></>
}
