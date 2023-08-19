import styles from './index.module.scss'

import { getImageSizeFromUrl } from '@/app/upload/utils/urlImageSize'
import { ENV_CONFIG } from '@/config'
import { images } from '@ROOT/next-image.config'

import Image from 'next/image'
import { forwardRef, useState } from 'react'
import clsx from 'clsx'
import { PhotoView } from 'react-photo-view'

import type { ImageProps } from 'next/image'

const optimizedDomainUrls = images.domains.map((s) => `https://${s}`)

function isOptimizedUrl(url = '') {
  if (url.startsWith('data:')) {
    return false
  }
  // 不以 http:// 或 https:// 或 // 开头的, 说明是站内的, 需要优化
  if (!/^(https?:)?\/\//i.test(url)) {
    return true
  }
  return optimizedDomainUrls.some((u) => url.startsWith(u))
}

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string
  alt?: string
  /**
   * @default false
   * @warning 开启 preview 则必须在其上层用 react-photo-view PhotoProvider 包裹
   */
  preview?: boolean
}

function RawImageWithState(
  { preview = false, ...props }: Props,
  ref: React.Ref<HTMLImageElement>
) {
  const src = props.src || '/pwa/android-chrome-512x512.png'
  const size = getImageSizeFromUrl(new URL(src, ENV_CONFIG.public.origin))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const elem = (
    <Image
      {...props}
      ref={ref}
      src={src}
      className={clsx(
        props.className,
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
      onLoadingComplete={(e) => {
        setLoading(false)
        props?.onLoadingComplete?.(e)
      }}
    />
  )

  if (!preview || !props.src || loading || error) {
    return elem
  }

  return <PhotoView src={src}>{elem}</PhotoView>
}

export const ImageWithState = forwardRef(RawImageWithState)
