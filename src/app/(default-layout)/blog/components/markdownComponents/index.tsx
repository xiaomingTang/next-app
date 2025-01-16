'use client'

import { encodeToId } from './utils'

import { Toc, useTocList } from '../Toc'

import Anchor from '@/components/Anchor'
import { ImageWithState } from '@/components/ImageWithState'
import { resolvePath } from '@/utils/url'
import { AnchorProvider } from '@/components/AnchorProvider'
import { useDefaultAsideDetail } from '@/layout/utils'
import { onAnchorClick } from '@/components/Anchor/utils'

import {
  Button,
  ClickAwayListener,
  IconButton,
  NoSsr,
  Tooltip,
  useEventCallback,
} from '@mui/material'
import { createElement, useEffect } from 'react'
import LinkIcon from '@mui/icons-material/Link'
import ListIcon from '@mui/icons-material/List'
import { matchRemotePattern } from 'next/dist/shared/lib/match-remote-pattern'

import type { RemotePattern } from 'next/dist/shared/lib/image-config'
import type { MDXComponents } from 'mdx/types'

type HeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>

function EscListener({ onEsc }: { onEsc: (e: KeyboardEvent) => void }) {
  const handler = useEventCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onEsc(e)
    }
  })

  useEffect(() => {
    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [handler])

  return <></>
}

function geneHeading(tag: `h${number}`) {
  return function Heading(props: HeadingProps) {
    const { visible: asideVisible } = useDefaultAsideDetail()
    const tocList = useTocList()
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
        <Anchor
          id={id}
          href={elementHash}
          aria-label='超链接, 指向页面内 heading'
          className='user-anchor'
          onClick={onAnchorClick}
        >
          <LinkIcon className='align-baseline' />
        </Anchor>
        <span className='user-heading-text'>{propsWithDefault.children}</span>
        <NoSsr>
          {/* TODO: setAnchorEl(null) after hash change */}
          {tocList.length > 0 && !asideVisible && (
            <AnchorProvider>
              {(anchorEl, setAnchorEl) => (
                <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                  <span
                    style={{
                      display: 'inline-flex',
                    }}
                  >
                    <Tooltip
                      open={!!anchorEl}
                      title={<Toc onClick={() => setAnchorEl(null)} />}
                    >
                      <IconButton
                        sx={{
                          p: 0,
                          ml: '4px',
                        }}
                        aria-label='目录'
                        className='user-heading-menu-trigger'
                        onClick={(e) => {
                          setAnchorEl((prev) => {
                            if (!prev) {
                              return e.currentTarget
                            }
                            return null
                          })
                        }}
                      >
                        <ListIcon />
                        <EscListener onEsc={() => setAnchorEl(null)} />
                      </IconButton>
                    </Tooltip>
                  </span>
                </ClickAwayListener>
              )}
            </AnchorProvider>
          )}
        </NoSsr>
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
  const srcUrl = resolvePath(src)
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
        maxHeight: '80vh',
      }}
    />
  )
}

export const markdownComponents: MDXComponents = {
  Button,
  // 目前暂不支持 props 传入 onClick（我自己暂无该需求）
  a: (props) => <Anchor {...props} onClick={onAnchorClick} ref={null} />,
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
