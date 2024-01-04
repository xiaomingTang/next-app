export function encodeToId(s: unknown) {
  if (typeof s === 'number' || typeof s === 'string') {
    const rawId = `${s}`
      .replace(/[^\u4e00-\u9fa5\-_a-zA-Z0-9]/g, '-')
      .split('-')
      .filter(Boolean)
      .join('-')
    return rawId ? `user-content-${rawId}` : ''
  }
  return ''
}

export function decodeToText(s: string | null) {
  return (s ?? '').slice(13)
}
