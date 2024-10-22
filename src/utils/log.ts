function getSrc() {
  try {
    throw new Error('error')
  } catch (error) {
    // at eval (webpack-internal:///(app-pages-browser)/./src/hooks/useInjectHistory.tsx:97:13)
    const stackStr = (error as Error).stack?.split('\n')?.[3]?.trim()
    if (!stackStr) {
      return ''
    }
    const match = stackStr.match(/.+(\.\/src\/.+)\)$/)
    return match ? match[1] : ''
  }
}

export function geneLog(props?: {
  prefix?: string
  suffix?: string
  enabled?: boolean
}) {
  const { prefix = '', suffix = '', enabled = true } = props ?? {}
  return function log(...args: unknown[]) {
    if (!enabled) {
      return
    }
    const src = getSrc()
    console.log(prefix, ...args, suffix, src ? ` at ${src}` : '')
  }
}
