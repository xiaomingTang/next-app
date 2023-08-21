export function numberFormat(val: number | string = '') {
  const num = +val
  return Number.isNaN(num) ? 0 : num
}
