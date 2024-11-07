import './global.css'

import { GetInitColorSchemeScript } from '@/components/GetColorScheme'
import { seo } from '@/utils/seo'
import { VConsole } from '@/components/VConsole'
import { Globals } from '@/globals'
import Providers from '@/globals/providers'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'

import type { Viewport } from 'next'

export const metadata = seo.defaults({})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1a2027' },
    { media: '(prefers-color-scheme: light)', color: '#eeeeee' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='zh-cn' suppressHydrationWarning>
      <head>
        <link rel='dns-prefetch' href={process.env.NEXT_PUBLIC_CDN_ROOT} />
      </head>
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
