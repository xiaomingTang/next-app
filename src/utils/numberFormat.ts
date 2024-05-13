export function numberFormat(val?: number | string | null, defaultValue = 0) {
  // +null 为 0, 需要提前在此判断
  if (val === null || val === undefined) {
    return defaultValue
  }
  if (typeof val === 'string' && val.trim() === '') {
    return defaultValue
  }
  const num = +val
  return Number.isNaN(num) ? defaultValue : num
}
