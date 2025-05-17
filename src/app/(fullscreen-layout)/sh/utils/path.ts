export const DELIMITER = '/'

function replaceInvalidChars(path: string | null | undefined) {
  if (!path) {
    return ''
  }
  return path
    .replace(/\\/g, DELIMITER)
    .replace(/[:*?'"<>|]/g, '')
    .trim()
}

export function normalizePath(path: string | null | undefined) {
  if (!path) {
    return ''
  }
  let p = replaceInvalidChars(path)

  const isAbsPath = p.startsWith(DELIMITER)
  const pieces = p
    .split(DELIMITER)
    .map((item) => item.trim())
    .filter(Boolean)
  const finalPieces: string[] = []
  for (let i = 0; i < pieces.length; i += 1) {
    const item = pieces[i]
    if (item === '.') {
      continue
    }
    if (item === '..') {
      finalPieces.pop()
      continue
    }
    finalPieces.push(item)
  }
  p = finalPieces.join(DELIMITER)
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
    .map((p) => replaceInvalidChars(p))
    .filter(isNonEmptyStr)
  for (const p of normalizedPaths) {
    if (p.startsWith(DELIMITER)) {
      path = p
    } else {
      path = path.endsWith(DELIMITER) ? path + p : path + DELIMITER + p
    }
  }
  return normalizePath(path)
}
