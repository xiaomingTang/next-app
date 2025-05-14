export const DELIMITER = '/'

export function normalizePath(path: string) {
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

export function resolvePath(...paths: string[]): string {
  let path = DELIMITER
  const normalizedPaths = paths.map((p) => normalizePath(p))
  for (const p of normalizedPaths) {
    if (p.startsWith(DELIMITER)) {
      path = p
    } else {
      path = path + DELIMITER + p
    }
  }
  return path
}
