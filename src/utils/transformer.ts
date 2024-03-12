export const GB_SIZE = 1000 * 1000 * 1000
export const MB_SIZE = 1000 * 1000
export const KB_SIZE = 1000

export function friendlySize(size: number) {
  // > 10G: 如 23.356G: 显示 23G
  if (size > GB_SIZE * 10) {
    const g = Math.round(size / GB_SIZE)
    return `${g}GB`
  }
  // 1 ~ 10G: 如 5.356G: 显示 5.4G
  if (size > GB_SIZE) {
    const g = (size / GB_SIZE).toFixed(1)
    return `${g}GB`
  }
  // > 10M: 如 23.356M: 显示 23M
  if (size > MB_SIZE * 10) {
    const m = Math.round(size / MB_SIZE)
    return `${m}MB`
  }
  // 1 ~ 10M: 如 5.356M: 显示 5.4M
  if (size > MB_SIZE) {
    const m = (size / MB_SIZE).toFixed(1)
    return `${m}MB`
  }
  // > 10K: 如 23.356K: 显示 23K
  if (size > 10 * KB_SIZE) {
    const k = Math.round(size / KB_SIZE)
    return `${k}KB`
  }
  // > 1K: 如 5.356K: 显示 5.4K
  if (size > KB_SIZE) {
    const k = (size / KB_SIZE).toFixed(1)
    return `${k}KB`
  }
  // <= 1K: 例: 显示 543B
  return `${size}B`
}
