/**
 * 返回 a % n 且结果范围限定在 0 - n
 */
export function remainder(a: number, n: number) {
  return ((a % n) + n) % n
}
