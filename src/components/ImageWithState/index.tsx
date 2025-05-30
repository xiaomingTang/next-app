import styles from './index.module.css'

import { getImageSizeFromUrl } from '@/utils/urlImageSize'
import imageConfig from '@ROOT/next-image.config'
import { resolvePath } from '@/utils/url'

import { hasRemoteMatch } from 'next/dist/shared/lib/match-remote-pattern'
import Image from 'next/image'
import { useState } from 'react'
import clsx from 'clsx'
import { PhotoView } from 'react-photo-view'

import type { ImageProps } from 'next/image'

function isOptimizedUrl(url = '') {
  if (url.startsWith('data:')) {
    return false
  }
  // 不以 http:// 或 https:// 或 // 开头的, 说明是站内的, 需要优化
  if (!/^(https?:)?\/\//i.test(url)) {
    return true
  }
  if (!imageConfig.remotePatterns || imageConfig.remotePatterns.length === 0) {
    return false
  }
  return hasRemoteMatch(
    imageConfig.domains ?? [],
    imageConfig.remotePatterns,
    resolvePath(url)
  )
}

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string
  alt?: string
  /**
   * @default false
   * @warning 开启 preview 则必须在其上层用 react-photo-view PhotoProvider 包裹
   */
  preview?: boolean
  ref?: React.Ref<HTMLImageElement>
}

export function ImageWithState({ preview = false, ref, ...props }: Props) {
  const src = props.src || '/static/images/empty.png'
  const size = getImageSizeFromUrl(resolvePath(src))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const previewEnabled = preview && !!props.src && !loading && !error

  const elem = (
    <Image
      {...props}
      ref={ref}
      src={src}
      className={clsx(
        props.className,
        previewEnabled && styles.previewEnabled,
        error && styles.error,
        // 有 placeholder blur 时用 blur, 否则采用默认 loading
        props.placeholder !== 'blur' && loading && styles.loading
      )}
      width={props?.width ?? size?.width ?? 512}
      height={props?.height ?? size?.height ?? 256}
      alt={props.alt ?? '图片'}
      unoptimized={props.unoptimized ?? !isOptimizedUrl(src)}
      onError={(e) => {
        setLoading(false)
        setError(true)
        props?.onError?.(e)
      }}
      onLoad={(e) => {
        setLoading(false)
        props?.onLoad?.(e)
      }}
    />
  )

  if (!previewEnabled) {
    return elem
  }

  return <PhotoView src={src}>{elem}</PhotoView>
}
