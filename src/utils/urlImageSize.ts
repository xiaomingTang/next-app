interface Size {
  width: number
  height: number
}

export function getImageSizeFromUrl(url: URL): Size | null {
  const resolutionStr = url.searchParams.get('r') ?? ''
  if (/^\d+x\d+$/.test(resolutionStr)) {
    const [w, h] = resolutionStr.split('x').map((s) => +s)
    return {
      width: w,
      height: h,
    }
  }
  return null
}

/**
 * 会修改入参 url
 */
export function setImageSizeForUrl(url: URL, size: Partial<Size>) {
  if (size.width && size.height) {
    url.searchParams.set('r', `${size.width}x${size.height}`)
  }
  return url
}
