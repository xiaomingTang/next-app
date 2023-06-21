import { ENV_CONFIG } from '@/config'

import type { Metadata } from 'next'

const { manifest } = ENV_CONFIG

interface SeoProps {
  title?: string
  description?: string
  keywords?: string
}

export const seo = {
  title: (customTitle = '', asFullTitle = false) => {
    const inputTitle = customTitle.trim()
    if (!inputTitle) {
      return manifest.name
    }
    if (asFullTitle) {
      return inputTitle
    }
    return `${inputTitle} | ${manifest.name}`
  },
  description: (customDescription = '', asFullDescription = false) => {
    const inputDescription = customDescription.trim()
    if (!inputDescription) {
      return manifest.description
    }
    if (asFullDescription) {
      return inputDescription
    }
    return `${inputDescription} | ${manifest.description}`
  },
  /**
   * keywords 间以英文 逗号 分隔
   */
  keywords: (customKeywords = '', asFullKeywords = false) => {
    const inputKeywords = customKeywords.trim()
    if (!inputKeywords) {
      return manifest.keywords
    }
    if (asFullKeywords) {
      return inputKeywords
    }
    return `${inputKeywords}, ${manifest.keywords}`
  },
  defaults: (props?: SeoProps): Metadata => ({
    metadataBase: new URL(ENV_CONFIG.public.origin),
    title: seo.title(props?.title),
    description: seo.description(props?.description),
    keywords: seo.keywords(props?.keywords),
    generator: 'Next.js',
    themeColor: [
      { media: '(prefers-color-scheme: dark)', color: '#1a2027' },
      { media: '(prefers-color-scheme: light)', color: '#eeeeee' },
    ],
    viewport: {
      width: 'device-width',
      initialScale: 1,
      minimumScale: 1,
      maximumScale: 1,
    },
    icons: manifest.icons,
    manifest: `/manifest.json`,
    formatDetection: {
      address: false,
      telephone: false,
      email: false,
    },
    appleWebApp: {
      capable: true,
      title: manifest.short_name,
    },
    openGraph: {
      type: 'website',
      title: seo.title(props?.title),
      description: seo.description(props?.description),
      siteName: manifest.name,
      url: ENV_CONFIG.public.origin,
      images: `${ENV_CONFIG.public.origin}/pwa/apple-touch-icon.png`,
    },
    twitter: {
      card: 'summary',
      title: seo.title(props?.title),
      description: seo.description(props?.description),
      creator: '@xiaomin58135718',
      images: `${ENV_CONFIG.public.origin}/pwa/android-chrome-192x192.png`,
    },
  }),
}
