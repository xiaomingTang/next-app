'use client'

import Anchor from '@/components/Anchor'
import { images } from '@ROOT/next-image.config'

import { Button } from '@mui/material'
import { createElement } from 'react'
import Image from 'next/image'
import LinkIcon from '@mui/icons-material/Link'

import type { MDXComponents } from 'mdx/types'

function encodeToId(s: unknown) {
  if (typeof s === 'number' || typeof s === 'string') {
    return `${s}`
      .replace(/[^\u4e00-\u9fa5\-_a-zA-Z0-9]/g, '-')
      .split('-')
      .filter(Boolean)
      .join('-')
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
    const stringified = encodeToId(propsWithDefault.children)
    const id = stringified ? `user-content-${stringified}` : ''
    if (!id) {
      return createElement(tag, propsWithDefault, propsWithDefault.children)
    }
    return createElement(
      tag,
      propsWithDefault,
      <>
        <Anchor
          id={id}
          href={`#${id}`}
          aria-label={`超链接, 指向页面内 hash: ${stringified}`}
          tabIndex={-1}
          className='user-anchor'
          onClick={(e) => {
            e.preventDefault()
            const url = new URL(window.location.href)
            url.hash = `#${id}`
            window.history.pushState(null, '', url)
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
  return (
    // 支持 /xxx/xxx.xxx
    /^\/\w/.test(url) ||
    // 支持 http(s)://{OPTIMIZED_DOMAIN}/.xxx
    optimizedDomainUrls.some((u) => url.startsWith(u))
  )
}

export const markdownComponents: MDXComponents = {
  Button,
  a: (props) => <Anchor {...props} ref={null} />,
  // TODO: preview
  img: (props) => {
    const src = props.src || '/pwa/android-chrome-512x512.png'
    return (
      <Image
        src={src}
        width={512}
        height={256}
        alt={props.alt ?? '图片'}
        unoptimized={!isOptimizedUrl(src)}
      />
    )
  },
  h1: geneHeading('h1'),
  h2: geneHeading('h2'),
  h3: geneHeading('h3'),
  h4: geneHeading('h4'),
  h5: geneHeading('h5'),
  h6: geneHeading('h6'),
}
