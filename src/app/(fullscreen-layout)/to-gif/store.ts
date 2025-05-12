import { getImageExtension } from './utils'
import { getFFmpeg } from './getFFmpeg'

import { getImageSize } from '@/utils/getImageSize'

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
    if (
      imageFiles.some((f) => {
        const ext = getImageExtension(f)
        return ext === 'gif' || ext === 'svg'
      })
    ) {
      throw new Error('不支持 gif 或 svg 格式的图片')
    }
    const imageInfos = await Promise.all(
      imageFiles.map(async (f) => {
        const url = URL.createObjectURL(f)
        const { width, height } = await getImageSize(url)
        const ext = getImageExtension(f)
        return {
          type: f.type,
          url,
          width,
          height,
          rawFile: f,
          propertyExt: ext,
        }
      })
    )
    const validImageInfos = imageInfos.filter(
      (i) => i.width > 0 && i.height > 0 && i.rawFile.size > 0
    )
    if (validImageInfos.length === 0) {
      throw new Error('没有有效的图片')
    }
    const delta = validImageInfos.length - imageInfos.length
    if (delta > 0) {
      toast(`已过滤掉 ${delta} 张空图片`)
    }
    if (!getFFmpeg().loaded) {
      toast('点击加载 ffmpeg 吧')
    }
    useRawImages.setState((state) => ({
      images: [...validImageInfos, ...state.images],
    }))
  },
})
