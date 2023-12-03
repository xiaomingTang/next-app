/**
 * @param hex #abcdef
 * @returns rgb: 0 - 1
 */
export function hex2Rgb(hex: string): [number, number, number] | null {
  // 去除可能包含的 '#' 符号
  const normalizedHex = hex.replace(/^#/, '')

  // 如果字符串长度不是 6，则返回 null（不合法的十六进制颜色代码）
  if (normalizedHex.length !== 6) {
    return null
  }

  // 将十六进制分解为红、绿、蓝分量
  const r = parseInt(normalizedHex.slice(0, 2), 16)
  const g = parseInt(normalizedHex.slice(2, 4), 16)
  const b = parseInt(normalizedHex.slice(4, 6), 16)

  // 返回 RGB 值
  return [r / 256, g / 256, b / 256]
}

/**
 * 输入输出均为 0 - 1
 */
export function rgb2Hsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  // 找到最大和最小的 RGB 分量
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  // 计算亮度（Lightness）
  const lightness = (max + min) / 2

  // 如果最大和最小值相等，说明是灰色，色调和饱和度都为0
  if (max === min) {
    return [0, 0, lightness]
  }

  // 计算饱和度（Saturation）
  const delta = max - min
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min)

  // 计算色调（Hue）
  let hue
  switch (max) {
    case r:
      hue = ((g - b) / delta + (g < b ? 6 : 0)) / 6
      break
    case g:
      hue = ((b - r) / delta + 2) / 6
      break
    case b:
      hue = ((r - g) / delta + 4) / 6
      break
    default:
      hue = 0
      break
  }

  return [hue, saturation, lightness]
}

/**
 * 输入输出均为 0 - 1
 */
export function hsl2Rgb(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  // 如果饱和度为 0，则色彩为灰色，亮度即为 RGB 的值
  if (s === 0) {
    return [l, l, l]
  }

  // 辅助函数，用于计算对应的 RGB 值
  function hueToRgb(p: number, q: number, t: number): number {
    let rt = t
    if (rt < 0) rt += 1
    if (rt > 1) rt -= 1
    if (rt < 1 / 6) return p + (q - p) * 6 * rt
    if (rt < 1 / 2) return q
    if (rt < 2 / 3) return p + (q - p) * (2 / 3 - rt) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const red = hueToRgb(p, q, h + 1 / 3)
  const green = hueToRgb(p, q, h)
  const blue = hueToRgb(p, q, h - 1 / 3)

  return [red, green, blue]
}

/**
 * 输入输出均为 0 - 1
 */
export function rgb2Hsv(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h = 0
  let s = 0
  const v = max

  const delta = max - min

  if (max !== 0) {
    s = delta / max
  }
  if (delta !== 0) {
    switch (max) {
      case r:
        h = (g - b) / delta + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / delta + 2
        break
      default:
        h = (r - g) / delta + 4
        break
    }
    h /= 6
  }

  return [h, s, v]
}

/**
 * 输入输出均为 0 - 1
 */
export function hsv2Rgb(
  h: number,
  s: number,
  v: number
): [number, number, number] {
  const rH = h * 6

  const i = Math.floor(rH)
  const f = rH - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      return [v, t, p]
    case 1:
      return [q, v, p]
    case 2:
      return [p, v, t]
    case 3:
      return [p, q, v]
    case 4:
      return [t, p, v]
    case 5:
      return [v, p, q]
    default:
      // Should not happened
      return [0, 0, 0]
  }
}

/**
 * 返回 hsl/hsv 的平均值 (0 - 1)
 */
export function imageDataStatistics(
  imageData: ImageData,
  type: 'hsl' | 'hsv'
): {
  average: [number, number, number]
} {
  const { data } = imageData
  const convertor = type === 'hsl' ? rgb2Hsl : rgb2Hsv

  // 存储 H 分量的值
  const values: [number, number, number][] = []

  // 将 RGB 转换为 HSL，并提取 H 分量的值
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    const a = data[i + 3] / 255
    if (a > 0) {
      values.push(convertor(r, g, b))
    }
  }

  // 计算平均值
  const average: [number, number, number] = [
    values.reduce((sum, value) => sum + value[0], 0) / values.length,
    values.reduce((sum, value) => sum + value[1], 0) / values.length,
    values.reduce((sum, value) => sum + value[2], 0) / values.length,
  ]

  return {
    average,
  }
}
