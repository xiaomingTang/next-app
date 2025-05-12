import { getModeOf } from '@/utils/math'

export function isInteger(value: number): boolean | string {
  if (value % 1 !== 0) {
    return '必须为整数'
  }
  return true
}

export function toOdd(value: number): number {
  const intValue = Math.floor(value)
  return intValue % 2 === 0 ? intValue : intValue + 1
}

export function shouldStretch(
  target: {
    width: number
    height: number
  },
  cur: {
    width: number
    height: number
  }
) {
  if (target.width > cur.width) {
    return (
      Math.abs((target.width / cur.width) * cur.height - target.height) < 3.5
    )
  }
  return Math.abs((cur.width / target.width) * target.height - cur.height) < 3.5
}

export function getPreferredSize(images: { width: number; height: number }[]) {
  const info =
    getModeOf(images, (img) => `${toOdd(img.width)}x${toOdd(img.height)}`) ??
    images[0]
  return {
    width: toOdd(info.width),
    height: toOdd(info.height),
  }
}
