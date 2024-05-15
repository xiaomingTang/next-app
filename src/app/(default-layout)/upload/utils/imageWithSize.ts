import { getImageSizeFromUrl, setImageSizeForUrl } from '@/utils/urlImageSize'
import { resolvePath } from '@/utils/url'

import sizeOf from 'image-size'

interface WithSizeProps {
  url: string | URL
  buffer?: Buffer
}

/**
 * 调用方需要自行保证待处理的是图片
 */
export async function imageWithSize({ url: originUrl, buffer }: WithSizeProps) {
  const url = resolvePath(originUrl)
  if (getImageSizeFromUrl(url)) {
    return url
  }
  try {
    const assetBuffer =
      buffer ?? Buffer.from(await (await fetch(url)).arrayBuffer())
    const size = sizeOf(assetBuffer)
    setImageSizeForUrl(url, size)
  } catch (error) {
    console.error(error)
  }
  return url
}
