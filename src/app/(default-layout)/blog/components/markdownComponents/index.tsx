'use client'

import Anchor from '@/components/Anchor'
import { DefaultLayoutScrollFlag } from '@/layout/components/ScrollFlag'
import { ImageWithState } from '@/components/ImageWithState'
import { ENV_CONFIG } from '@/config'
import { resolvePath } from '@/utils/url'

import { Button } from '@mui/material'
import { createElement } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import { matchRemotePattern } from 'next/dist/shared/lib/match-remote-pattern'

import type { RemotePattern } from 'next/dist/shared/lib/image-config'
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

function Video({ src = '', poster = '' }: { src?: string; poster?: string }) {
  if (!src) {
    return <></>
  }
  return (
    <video
      src={src}
      poster={poster}
      width={720}
      height={450}
      controls
      autoPlay={false}
      style={{
        width: '100%',
        maxWidth: 720,
      }}
    />
  )
}

const thisSiteUrl = resolvePath('/')

function formatIframeSrc(src?: string) {
  if (!src) {
    return null
  }
  const srcUrl = new URL(src, ENV_CONFIG.public.origin)
  if (srcUrl.host === 'bilibili.com' || srcUrl.host.endsWith('.bilibili.com')) {
    srcUrl.searchParams.set('autoplay', '0')
    return srcUrl
  }
  /**
   * youtube 嵌入网址必须为:
   * https://www.youtube.com/embed/yU-GOqtFei0
   */
  if (srcUrl.host === 'youtube.com' || srcUrl.host.endsWith('.youtube.com')) {
    // https://www.youtube.com/watch?v=yU-GOqtFei0
    if (srcUrl.pathname === '/watch' && srcUrl.searchParams.get('v')) {
      srcUrl.pathname = `/embed/${srcUrl.searchParams.get('v')}`
      return srcUrl
    }
  }
  // https://youtu.be/yU-GOqtFei0
  if (srcUrl.host === 'youtu.be' || srcUrl.host.endsWith('.youtu.be')) {
    srcUrl.host = 'youtube.com'
    srcUrl.pathname = `/embed${srcUrl.pathname}`
    return srcUrl
  }

  // 以下是所有白名单
  const whiteListPatterns: RemotePattern[] = [
    { hostname: thisSiteUrl.hostname },
    { hostname: `**.${thisSiteUrl.hostname}` },
    { hostname: 'youtu.be' },
    { hostname: 'youtube.com' },
    { hostname: 'bilibili.com' },
    { hostname: '**.youtu.be' },
    { hostname: '**.youtube.com' },
    { hostname: '**.bilibili.com' },
  ]

  if (
    whiteListPatterns.some((pattern) => matchRemotePattern(pattern, srcUrl))
  ) {
    return srcUrl
  }
  return null
}

function Iframe({ src = '' }: { src?: string }) {
  const srcUrl = formatIframeSrc(src)

  if (!srcUrl) {
    return <></>
  }

  return (
    <iframe
      src={srcUrl.href}
      width={720}
      height={450}
      allowFullScreen
      allow='accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share'
      style={{
        width: '100%',
        maxWidth: 720,
      }}
    />
  )
}

export const markdownComponents: MDXComponents = {
  Button,
  a: (props) => <Anchor {...props} ref={null} />,
  img: ({ src, alt }) => <ImageWithState src={src} alt={alt} preview />,
  h1: geneHeading('h1'),
  h2: geneHeading('h2'),
  h3: geneHeading('h3'),
  h4: geneHeading('h4'),
  h5: geneHeading('h5'),
  h6: geneHeading('h6'),
  Video,
  Iframe,
}
