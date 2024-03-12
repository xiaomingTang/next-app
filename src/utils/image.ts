import { hsl2Rgb, hsv2Rgb, rgb2Hsl, rgb2Hsv } from './color'

export function cloneImageData(originalImageData: ImageData): ImageData {
  // 创建新的 Uint8ClampedArray，复制原始像素数据
  const clonedData = new Uint8ClampedArray(originalImageData.data)

  // 创建新的 ImageData 对象
  const clonedImageData = new ImageData(
    clonedData,
    originalImageData.width,
    originalImageData.height
  )

  return clonedImageData
}

export function adjustImageData({
  imgData,
  targetHsl,
  averageHsl,
  type,
}: {
  imgData: ImageData
  targetHsl: [number, number, number]
  averageHsl: [number, number, number]
  type: 'hsl' | 'hsv'
}) {
  const newImgData = cloneImageData(imgData)
  const { data } = newImgData
  const [aH] = averageHsl
  const [tH] = targetHsl
  const fromRgb = type === 'hsl' ? rgb2Hsl : rgb2Hsv
  const toRgb = type === 'hsl' ? hsl2Rgb : hsv2Rgb
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
    if (a > 0) {
      const [h, s, l] = fromRgb(r, g, b)
      let rH = h
      if (aH < 1) {
        if (h <= aH) {
          rH = (h / aH) * tH
        } else {
          rH = 1 - ((1 - h) / (1 - aH)) * (1 - tH)
        }
      }
      const newRgb = toRgb(rH, s, l)
      ;[data[i], data[i + 1], data[i + 2]] = newRgb
    }
  }
  return newImgData
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
