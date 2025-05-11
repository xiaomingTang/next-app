/**
 * 返回 a % n 且结果范围限定在 0 - n
 */
export function remainder(a: number, n: number) {
  return ((a % n) + n) % n
}

interface Point {
  x: number
  y: number
}

function sign(p1: Point, p2: Point, p3: Point): number {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)
}

function isPointInsideTriangle(
  point: Point,
  p1: Point,
  p2: Point,
  p3: Point
): boolean {
  const b1 = sign(point, p1, p2) < 0.0
  const b2 = sign(point, p2, p3) < 0.0
  const b3 = sign(point, p3, p1) < 0.0

  return b1 === b2 && b2 === b3
}

export function isPointInsideQuadrilateral(
  point: Point,
  quadPoints: [Point, Point, Point, Point]
): boolean {
  const [p1, p2, p3, p4] = quadPoints

  // 判断点是否在四边形的内部
  return (
    isPointInsideTriangle(point, p1, p2, p3) ||
    isPointInsideTriangle(point, p1, p3, p4)
  )
}

/**
 * 计算数组的众数
 */
export function getMode<T extends number | string>(arr: T[]): T | undefined
export function getMode<T extends number | string>(arr: [T, ...T[]]): T
export function getMode<T extends number | string>(arr: T[]) {
  const frequencyMap = {} as Record<T, number>
  let maxCount = 0
  let mode = arr[0]

  for (let i = 0; i < arr.length; i += 1) {
    const item = arr[i]
    const newCount = (frequencyMap[item] || 0) + 1
    frequencyMap[item] = newCount

    if (newCount > maxCount) {
      maxCount = newCount
      mode = item
    }
  }
  return mode
}

export function getModeOf<T>(
  arr: T[],
  toString: (item: T) => string
): T | undefined
export function getModeOf<T>(arr: [T, ...T[]], toString: (item: T) => string): T
export function getModeOf<T>(arr: T[], toString: (item: T) => string) {
  const frequencyMap = {} as Record<string, number>
  let maxCount = 0
  let mode = arr[0]

  for (let i = 0; i < arr.length; i += 1) {
    const item = arr[i]
    const key = toString(item)
    const newCount = (frequencyMap[key] || 0) + 1
    frequencyMap[key] = newCount

    if (newCount > maxCount) {
      maxCount = newCount
      mode = item
    }
  }
  return mode
}
