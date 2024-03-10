import { hsl2Rgb, hsv2Rgb, rgb2Hsl, rgb2Hsv } from './convert'

import { ENV_CONFIG } from '@/config'

export async function file2DataURL(f: Blob) {
  if (!(f instanceof Blob)) {
    if (ENV_CONFIG.public.nodeEnv === 'production') {
      console.error('file2DataURL: 参数错误，不是 Blob: ', f)
    } else {
      throw new Error('file2DataURL: 参数错误，不是 Blob')
    }
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    const unbindEvents = () => {
      reader.onerror = null
      reader.onabort = null
      reader.onload = null
    }

    const onError = () => {
      unbindEvents()
      reject(new Error('文件转 DataURL 失败'))
    }

    reader.readAsDataURL(f)
    reader.onerror = onError
    reader.onabort = onError

    reader.onload = () => {
      unbindEvents()
      resolve(reader.result as string)
    }
  })
}

export async function file2Img(f: Blob) {
  const dataUrl = await file2DataURL(f)

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()

    const unbindEvents = () => {
      img.onabort = null
      img.oncancel = null
      img.onerror = null
      img.onload = null
    }

    const onError = () => {
      unbindEvents()
      reject(new Error('文件转图片预览失败'))
    }

    img.onabort = onError
    img.oncancel = onError
    img.onerror = onError
    img.onload = () => {
      unbindEvents()
      resolve(img)
    }

    img.src = dataUrl
  })
}

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
