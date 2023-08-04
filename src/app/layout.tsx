/* eslint-disable @next/next/no-sync-scripts */
import './globals.css'

import { GetInitColorSchemeScript } from './GetColorScheme'

import Contexts from '@/common/contexts'
import Polyfills from '@/common/polyfills'
import Providers from '@/common/providers'
import { seo } from '@/utils/seo'
import { GA } from '@/analytics/GA'

import clsx from 'clsx'
import { Inter } from 'next/font/google'

import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  ...seo.defaults({}),
  alternates: {
    types: {
      // https://taoshu.in/webfeed/lets-webfeed.html
      'application/rss+xml': [{ url: 'rss.xml', title: 'RSS' }],
    },
  },
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
      <body className={clsx(inter.className, 'min-h-screen')}>
        {/* TODO: 这个 ENV_CONFIG 的实现可能有问题 */}
        <script src='/__ENV_CONFIG__.js' />
        <GA />
        <GetInitColorSchemeScript />
        <Providers>
          <Polyfills />
          <Contexts />
          {children}
        </Providers>
      </body>
    </html>
  )
}
