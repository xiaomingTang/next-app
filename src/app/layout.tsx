/* eslint-disable @next/next/no-sync-scripts */
import './global.css'

import { GetInitColorSchemeScript } from '@/components/GetColorScheme'
import { seo } from '@/utils/seo'
import { VConsole } from '@/components/VConsole'
import { Globals } from '@/globals'
import Providers from '@/globals/providers'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'

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
    { media: '(prefers-color-scheme: dark)', color: '#1a2027' },
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
        <AppRouterCacheProvider options={{ key: 'emo' }}>
          <VConsole />
          <GetInitColorSchemeScript />
          <Providers>
            <Globals />
            {children}
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
