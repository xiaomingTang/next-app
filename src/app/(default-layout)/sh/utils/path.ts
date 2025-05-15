export const DELIMITER = '/'

export function normalizePath(path: string | null | undefined) {
  if (!path) {
    return ''
  }
  let p = path
    .replace(/\\/g, DELIMITER)
    .replace(/[:*?'"<>|]/g, '')
    .trimStart()
    .replace(/[. ]+$/g, '')

  const isAbsPath = p.startsWith(DELIMITER)
  p = p
    .split(DELIMITER)
    .map((item) => item.trimStart().replace(/[. ]+$/g, ''))
    .filter(Boolean)
    .join(DELIMITER)
  if (isAbsPath) {
    return DELIMITER + p
  }
  return p
}

function isNonEmptyStr(s: string | null | undefined): s is string {
  return !!s
}

export function resolvePath(...paths: (string | null | undefined)[]): string {
  let path = DELIMITER
  const normalizedPaths = paths
    .map((p) => normalizePath(p))
    .filter(isNonEmptyStr)
  for (const p of normalizedPaths) {
    if (p.startsWith(DELIMITER)) {
      path = p
    } else {
      path = path + DELIMITER + p
    }
  }
  return path
}
