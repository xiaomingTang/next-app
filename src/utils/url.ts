import { ENV_CONFIG } from '@/config'

import type { RemotePattern } from 'next/dist/shared/lib/image-config'

export function resolvePath(pathname: string) {
  const url = new URL(pathname, ENV_CONFIG.public.origin)
  return url
}

function patternEqual({
  patternArray,
  testedArray,
}: {
  patternArray: string[]
  testedArray: string[]
}) {
  const maxLen = Math.max(patternArray.length, testedArray.length)
  for (let i = 0; i < maxLen; i += 1) {
    const pattern = patternArray[i]
    if (pattern === '**') {
      return true
    }
    if (pattern === '*') {
      break
    }
    if (pattern !== testedArray[i]) {
      return false
    }
  }
  return true
}

export function urlMatchPattern(url: URL, pattern: RemotePattern) {
  if (pattern.protocol && url.protocol !== pattern.protocol) {
    return false
  }
  if (pattern.port && url.port !== pattern.port) {
    return false
  }
  if (
    pattern.pathname &&
    !patternEqual({
      patternArray: pattern.pathname.split('/').filter(Boolean),
      testedArray: url.pathname.split('/').filter(Boolean),
    })
  ) {
    return false
  }
  if (
    pattern.hostname &&
    !patternEqual({
      patternArray: pattern.hostname.split('.').filter(Boolean).toReversed(),
      testedArray: url.hostname.split('.').filter(Boolean).toReversed(),
    })
  ) {
    return false
  }
  return true
}
