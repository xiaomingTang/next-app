'use client'

import Anchor from '@/components/Anchor'
import { images } from '@ROOT/next-image.config'
import { DefaultLayoutScrollFlag } from '@/layout/components/ScrollFlag'
import { ENV_CONFIG } from '@/config'
import { getImageSizeFromUrl } from '@/app/upload/utils/urlImageSize'

import { Button } from '@mui/material'
import { createElement } from 'react'
import Image from 'next/image'
import LinkIcon from '@mui/icons-material/Link'
import { PhotoView } from 'react-photo-view'

import type { MDXComponents } from 'mdx/types'

export function encodeToId(s: unknown) {
  if (typeof s === 'number' || typeof s === 'string') {
    const rawId = `${s}`
      .replace(/[^\u4e00-\u9fa5\-_a-zA-Z0-9]/g, '-')
      .split('-')
      .filter(Boolean)
      .join('-')
    return rawId ? `user-content-${rawId}` : ''
  }
  return ''
}

type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>

function geneHeading(tag: `h${number}`) {
  return function Heading(props: HeadingProps) {
    const propsWithDefault: HeadingProps = {
      ...props,
      tabIndex: props.tabIndex ?? -1,
      className: 'user-heading',
    }
    const id = encodeToId(propsWithDefault.children?.toString())
    const elementHash = `#${id}`

    if (!id) {
      return createElement(tag, propsWithDefault, propsWithDefault.children)
    }
    return createElement(
      tag,
      propsWithDefault,
      <>
        <DefaultLayoutScrollFlag id={id} inline />
        <Anchor
          href={elementHash}
          aria-label={`超链接, 指向页面内 heading`}
          tabIndex={-1}
          className='user-anchor'
          onClick={(e) => {
            e.preventDefault()
            const url = new URL(window.location.href)
            const hash = `#${id}`
            url.hash = hash
            window.history.replaceState(null, '', url)
            document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <LinkIcon className='align-baseline' />
        </Anchor>
        {propsWithDefault.children}
      </>
    )
  }
}

const optimizedDomainUrls = images.domains.map((s) => `https://${s}`)

function isOptimizedUrl(url = '') {
  // 不以 http:// 或 https:// 或 // 开头的, 说明是站内的, 需要优化
  if (!/^(https?:)?\/\//i.test(url)) {
    return true
  }
  return optimizedDomainUrls.some((u) => url.startsWith(u))
}

function CustomImage(
  props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
) {
  const src = props.src || '/pwa/android-chrome-512x512.png'
  const size = getImageSizeFromUrl(new URL(src, ENV_CONFIG.public.origin))

  return (
    <PhotoView key={src} src={src}>
      <Image
        src={src}
        width={size?.width ?? 512}
        height={size?.height ?? 256}
        alt={props.alt ?? '图片'}
        unoptimized={!isOptimizedUrl(src)}
      />
    </PhotoView>
  )
}

export const markdownComponents: MDXComponents = {
  Button,
  a: (props) => <Anchor {...props} ref={null} />,
  img: CustomImage,
  h1: geneHeading('h1'),
  h2: geneHeading('h2'),
  h3: geneHeading('h3'),
  h4: geneHeading('h4'),
  h5: geneHeading('h5'),
  h6: geneHeading('h6'),
}
