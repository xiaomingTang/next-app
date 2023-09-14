import type { Color } from './color'

function calcColor(
  c1: number,
  c2: number,
  c3: number,
  c4: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const k1 = c1 + (x / width) * (c2 - c1)
  const k2 = c3 + (x / width) * (c4 - c3)
  return k1 + (y / height) * (k2 - k1)
}

export function drawWallpaper(
  imageData: ImageData,
  clt: Color,
  crt: Color,
  clb: Color,
  crb: Color
) {
  const { width, height } = imageData
  const [r1, g1, b1, a1] = clt
  const [r2, g2, b2, a2] = crt
  const [r3, g3, b3, a3] = clb
  const [r4, g4, b4, a4] = crb
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const n = (x + y * width) * 4
      /* eslint-disable no-param-reassign */
      imageData.data[n] = calcColor(r1, r2, r3, r4, x, y, width, height)
      imageData.data[n + 1] = calcColor(g1, g2, g3, g4, x, y, width, height)
      imageData.data[n + 2] = calcColor(b1, b2, b3, b4, x, y, width, height)
      imageData.data[n + 3] = calcColor(a1, a2, a3, a4, x, y, width, height)
      /* eslint-enable no-param-reassign */
    }
  }
  return imageData
}
