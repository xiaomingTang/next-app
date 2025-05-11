import { getImageExtension } from './utils'
import { getFFmpeg } from './getFFmpeg'

import { getImageSize } from '@/utils/getImageSize'
import { getModeOf } from '@/utils/math'

import { withStatic } from '@zimi/utils'
import { create } from 'zustand'
import toast from 'react-hot-toast'

export interface ImageInfo {
  type: string
  /**
   * blob url
   * @example blob:https://example.com/12345678-1234-1234-1234-123456789012
   */
  url: string
  width: number
  height: number
  rawFile: File
  /**
   * 综合推断的图片的扩展名
   * （避免用户输入图片的扩展名有误）
   */
  propertyExt: string
}

const useRawImages = create(() => ({
  images: [] as ImageInfo[],
}))

export const useImages = withStatic(useRawImages, {
  async prependImages(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      throw new Error('请选择图片文件')
    }
    if (!getFFmpeg().loaded) {
      toast('点击加载 ffmpeg 吧')
    }
    const prevImageInfos = useRawImages.getState().images
    const allImageFiles = [
      ...imageFiles,
      ...prevImageInfos.map((i) => i.rawFile),
    ]
    const allImagesWithSize = await Promise.all(
      allImageFiles.map(async (f) => {
        const url = URL.createObjectURL(f)
        const { width, height } = await getImageSize(url)
        const ext = getImageExtension(f)
        return {
          type: f.type,
          url: URL.createObjectURL(f),
          width,
          height,
          rawFile: f,
          propertyExt: ext,
        }
      })
    )
    if (allImagesWithSize.some((i) => i.propertyExt === 'gif')) {
      throw new Error('不支持 GIF 格式的图片')
    }
    const preferredSize =
      getModeOf(allImagesWithSize, (i) => `${i.width}x${i.height}`) ??
      allImagesWithSize[0]
    if (preferredSize.width <= 0 || preferredSize.height <= 0) {
      throw new Error('图片尺寸必须大于 0')
    }
    useRawImages.setState({
      images: allImagesWithSize.map((i) => ({
        ...i,
        width: preferredSize.width,
        height: preferredSize.height,
      })),
    })
  },
})
