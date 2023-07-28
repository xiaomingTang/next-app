import { ENV_CONFIG } from '@/config'

export function resolvePath(pathname: string) {
  const url = new URL(pathname, ENV_CONFIG.public.origin)
  return url
}
