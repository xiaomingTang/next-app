import { resolvePath } from '@/utils/url'

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/u/', '/project/new', '/qrcode/generate'],
    },
    sitemap: resolvePath('/sitemap.xml').href,
  }
}
