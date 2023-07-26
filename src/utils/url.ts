import { ENV_CONFIG } from '@/config'
import { images } from '@ROOT/next-image.config'

export function resolvePath(pathname: string) {
  const url = new URL(pathname, ENV_CONFIG.public.origin)
  return url
}

const optimizedDomainUrls = images.domains.map((s) => `https://${s}`)

export function isOptimizedUrl(url = '') {
  return (
    // 支持 /xxx/xxx.xxx
    /^\/\w/.test(url) ||
    // 支持 http(s)://{OPTIMIZED_DOMAIN}/.xxx
    optimizedDomainUrls.some((u) => url.startsWith(u))
  )
}
