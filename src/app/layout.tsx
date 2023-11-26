/* eslint-disable @next/next/no-sync-scripts */
import './global.css'

import { GetInitColorSchemeScript } from '@/components/GetColorScheme'
import Contexts from '@/common/contexts'
import Polyfills from '@/common/polyfills'
import Providers from '@/common/providers'
import { seo } from '@/utils/seo'
import { VConsole } from '@/components/VConsole'
import { GlobalAudioPlayer } from '@/components/GlobalAudioPlayer'
import { ServerProvider } from '@/common/providers/ServerProvider'

import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  ...seo.defaults({}),
  alternates: {
    types: {
      // https://taoshu.in/webfeed/lets-webfeed.html
      'application/rss+xml': [{ url: 'rss.xml', title: 'RSS' }],
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#4d4d4d' },
    { media: '(prefers-color-scheme: light)', color: '#eeeeee' },
  ],
  width: 'device-width',
  initialScale: 1,
}

function serverErrorHandler() {
  if (typeof process === 'undefined') {
    return
  }
  process.on('uncaughtException', (e, origin) => {
    // pass
    console.log(e, origin)
  })
  process.on('unhandledRejection', (reason, promise) => {
    // pass
    console.log(reason, promise)
  })
}

serverErrorHandler()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-cn' suppressHydrationWarning>
      <body>
        <VConsole />
        {/* TODO: 这个 ENV_CONFIG 的实现可能有问题 */}
        <script src='/__ENV_CONFIG__.js' />
        <GetInitColorSchemeScript />
        <Providers>
          <ServerProvider>
            <GlobalAudioPlayer />
            <Polyfills />
            <Contexts />
            {children}
          </ServerProvider>
        </Providers>
      </body>
    </html>
  )
}
