export const GB_SIZE = 1000 * 1000 * 1000
export const MB_SIZE = 1000 * 1000
export const KB_SIZE = 1000

/**
 * - > 10G: 如 23.356G: 显示 23GB
 * - 1 ~ 10G: 如 5.356G: 显示 5.4GB
 * - > 10M: 如 23.356M: 显示 23MB
 * - 1 ~ 10M: 如 5.356M: 显示 5.4MB
 * - > 10K: 如 23.356K: 显示 23KB
 * - > 1K: 如 5.356K: 显示 5.4KB
 * - <= 1K: 如 543B: 显示 543B
 */
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
  // 为免小数, 直接 Math.round 了
  return `${Math.round(size)}B`
}

/**
 * 格式化时间
 * 一小时内, 显示 "一小时内"
 * 一天内, 显示 "xx 小时前"
 * 一周内, 显示 "xx 天前"
 * 一周以上, 同一年, 显示 "x月x日" (显示年月日, 而非 xx-xx, 因为 a11y)
 * 一周以上, 不同年, 显示 "xxxx年x月x日" (显示年月日, 而非 xxxx-xx-xx, 因为 a11y)
 */
export function friendlyFormatTime(time: number | string | Date) {
  const date = time instanceof Date ? time : new Date(time)
  const md = `${date.getMonth() + 1}月${date.getDate()}日`
  return `${date.getFullYear()}年${md}`
}

function padTwo(s: string | number) {
  return (s ?? '').toString().trim().padStart(2, '0')
}

/**
 * @returns "xxxx-xx-xx xx:xx:xx"
 */
export function formatTime(time: number | string | Date) {
  const date = time instanceof Date ? time : new Date(time)
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(
    date.getDate()
  )} ${padTwo(date.getHours())}:${padTwo(date.getMinutes())}:${padTwo(
    date.getSeconds()
  )}`
}
