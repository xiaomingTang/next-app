/**
 * [255, 255, 255, 1]
 */
export type Color = [number, number, number, number]

/**
 * @param str
 * - rgb(12, 32, 43)
 * - rgba(12, 32, 43, 0.5)
 * - #f00
 * - #ff0000
 * - 1235524
 */
export function toColor(inputStr: string, defaultColor?: Color): Color {
  // 移除全部空格
  const str = inputStr.replace(/\s/g, '').toLowerCase()
  if (str.startsWith('#')) {
    const rest = str.slice(1).split('')
    switch (rest.length) {
      case 3: {
        const [r, g, b] = rest
        return [
          parseInt(`${r}${r}`, 16),
          parseInt(`${g}${g}`, 16),
          parseInt(`${b}${b}`, 16),
          1,
        ]
      }
      case 6: {
        const [r1, r2, g1, g2, b1, b2] = rest
        return [
          parseInt(`${r1}${r2}`, 16),
          parseInt(`${g1}${g2}`, 16),
          parseInt(`${b1}${b2}`, 16),
          1,
        ]
      }
      case 4: {
        const [r, g, b, a] = rest
        return [
          parseInt(`${r}${r}`, 16),
          parseInt(`${g}${g}`, 16),
          parseInt(`${b}${b}`, 16),
          parseInt(`${a}${a}`, 16) / 255,
        ]
      }
      case 8: {
        const [r1, r2, g1, g2, b1, b2, a1, a2] = rest
        return [
          parseInt(`${r1}${r2}`, 16),
          parseInt(`${g1}${g2}`, 16),
          parseInt(`${b1}${b2}`, 16),
          parseInt(`${a1}${a2}`, 16) / 255,
        ]
      }
      default: {
        if (defaultColor) {
          return [...defaultColor]
        }
        throw new Error(`invalid color: ${str}`)
      }
    }
  }
  const result = /rgba?\((\d+),(\d+),(\d+)(,([\d.]+))?\)/.exec(str)
  if (!result) {
    if (defaultColor) {
      return [...defaultColor]
    }
    throw new Error(`invalid color: ${str}`)
  }
  const [_prefix, r, g, b, _commaAlpha, a = '1'] = result
  return [parseInt(r, 10), parseInt(g, 10), parseInt(b, 10), parseInt(a, 10)]
}

export function getComplementaryColor([r, g, b]: Color): Color {
  return [255 - r, 255 - g, 255 - b, 1]
}

export function colorToCss(
  [r, g, b, a]: Color,
  type: 'rgb' | 'rgba' | 'hex' | 'hex-alpha'
) {
  switch (type) {
    case 'rgb':
      return `rgb(${r},${g},${b})`
    case 'rgba':
      return `rgba(${r},${g},${b},${a})`
    case 'hex':
      return `#${[r, g, b]
        .map((c) => c.toString(16).padStart(2, '0'))
        .join('')}`
    default:
      return `#${[r, g, b, a]
        .map((c) => c.toString(16).padStart(2, '0'))
        .join('')}`
  }
}
