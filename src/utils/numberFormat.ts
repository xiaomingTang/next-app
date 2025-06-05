type MaybeNum = number | string | null | undefined | void

export function numberFormat(
  val?: MaybeNum,
  defaultValue?: number | undefined
): number
export function numberFormat(val: MaybeNum, defaultValue: null): number | null
export function numberFormat(
  val?: MaybeNum,
  defaultValue: number | null | undefined = 0
) {
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
