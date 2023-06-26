function padTwo(s: string | number) {
  return (s ?? '').toString().trim().padStart(2, '0')
}

/**
 * 格式化时间
 * 一小时内, 显示 "一小时内"
 * 一天内, 显示 "xx 小时前"
 * 一周内, 显示 "xx 天前"
 * 一周以上, 显示 "xxxx-xx-xx"
 */
export function friendlyFormatTime(time: number | string | Date) {
  const date = time instanceof Date ? time : new Date(time)
  const diff = Date.now() - date.getTime()
  const hour = 60 * 60 * 1000
  if (diff < hour) {
    return '一小时内'
  }
  if (diff < 24 * hour) {
    return `${Math.floor(diff / hour)}小时前`
  }
  if (diff < 7 * 24 * hour) {
    return `${Math.floor(diff / (24 * hour))}天前`
  }
  return `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(
    date.getDate()
  )}`
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
