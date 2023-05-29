/* eslint-disable @next/next/no-sync-scripts */
import './globals.css'

import Contexts from '@/common/contexts'
import Polyfills from '@/common/polyfills'
import Providers from '@/common/providers'
import { seo } from '@/utils/seo'

import clsx from 'clsx'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = seo.defaults({
  title: 'home',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-cn' data-theme='dark'>
      <head>
        <script src='/__ENV_CONFIG__.js' />
      </head>
      <body className={clsx(inter.className, 'min-h-screen')}>
        <Providers>
          <Polyfills />
          <Contexts />
          {children}
        </Providers>
      </body>
    </html>
  )
}
