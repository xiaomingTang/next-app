/* eslint-disable @next/next/no-sync-scripts */
import './globals.css'

import { GetInitColorSchemeScript } from './GetColorScheme'

import Contexts from '@/common/contexts'
import Polyfills from '@/common/polyfills'
import Providers from '@/common/providers'
import PWAStaleTip from '@/pwa/PWAStaleTip'
import { seo } from '@/utils/seo'

import clsx from 'clsx'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = seo.defaults({
  title: 'home',
})

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
        <GetInitColorSchemeScript />
        <Providers>
          <Polyfills />
          <Contexts />
          {children}
          <PWAStaleTip />
        </Providers>
      </body>
    </html>
  )
}
