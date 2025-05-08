import './global.css'

import { GetInitColorSchemeScript } from '@/components/GetColorScheme'
import { seo } from '@/utils/seo'
import { Globals } from '@/globals'
import Providers from '@/globals/providers'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import Script from 'next/script'

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

export function VConsoleLoader({ enabled = false }: { enabled?: boolean }) {
  if (enabled) {
    return (
      <>
        <Script
          src='/scripts/vconsole.min.js'
          id='vconsole.min.js'
          strategy='beforeInteractive'
        />
        <Script
          id='vconsole-instance'
          dangerouslySetInnerHTML={{
            __html: `
            if (typeof VConsole !== 'undefined') {
              const vConsole = new VConsole({
                defaultPlugins: ['system', 'network', 'element', 'storage', 'console'],
              })
              window.vConsole = vConsole
            }
          `,
          }}
        />
      </>
    )
  }
  return <></>
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
          <VConsoleLoader />
          <Script
            src='/scripts/wasm_exec.js'
            id='wasm_exec'
            strategy='beforeInteractive'
          />
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
