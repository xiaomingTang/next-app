'use client'

import { BLOG_MARKDOWN_ID } from './constants'

import { create } from 'zustand'
import { Box, Divider, Link, Typography } from '@mui/material'
import { forwardRef, useEffect } from 'react'
import clsx from 'clsx'

import type { BoxProps } from '@mui/material'

type HeadingTree = {
  text: string
  id: string
  depth: number
  children: HeadingTree[]
}

function getHeadings() {
  const article = document.querySelector(`#${BLOG_MARKDOWN_ID}`)
  const headings = Array.from(
    article?.querySelectorAll(
      'h1.user-heading,h2.user-heading,h3.user-heading,h4.user-heading,h5.user-heading,h6.user-heading'
    ) ?? []
  ) as HTMLElement[]
  const headingInfos = headings.map<HeadingTree>((h) => {
    const textElem = h.querySelector<HTMLSpanElement>('.user-heading-text')
    const idElem = h.querySelector<HTMLSpanElement>('.user-heading-scroll-flag')
    return {
      text: textElem?.innerText || '出错了',
      id: idElem?.getAttribute('id') ?? '',
      depth: +(h.tagName.slice(1) ?? 1),
      children: [],
    }
  })
  return headingInfos
}

function toTree(infos: HeadingTree[]) {
  const root: HeadingTree = {
    text: 'root',
    id: 'root',
    depth: 0,
    children: [],
  }
  const stack: HeadingTree[] = [root]
  let i = 0
  while (i < infos.length) {
    const curInfo = infos[i]
    const stackTop = stack[stack.length - 1]
    if (curInfo.depth > stackTop.depth) {
      stackTop.children.push(curInfo)
      stack.push(curInfo)
      i += 1
    } else {
      stack.pop()
    }
  }
  return root
}

function TocItem(tree: HeadingTree) {
  return (
    <li className='pl-4'>
      <Link
        href={`#${tree.id}`}
        noWrap
        sx={{
          display: 'block',
          mb: '4px',
          width: '100%',
          overflow: 'hidden',
          color: 'inherit',
          textDecoration: 'none',
          fontSize: '0.875rem',
          ':hover': {
            color: 'primary.main',
            textDecoration: 'underline',
          },
        }}
        onClick={(e) => {
          e.preventDefault()
          const url = new URL(window.location.href)
          const hash = `#${tree.id}`
          url.hash = hash
          window.history.replaceState(null, '', url)
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        {tree.text}
      </Link>
      {tree.children.length > 0 && (
        <ul>
          {tree.children.map((item) => (
            <TocItem key={`${item.depth}-${item.id}`} {...item} />
          ))}
        </ul>
      )}
    </li>
  )
}

const useRawTocStore = create<{
  tocList: HeadingTree[]
}>(() => ({
  tocList: [],
}))

export function useTocList() {
  const tocList = useRawTocStore((s) => s.tocList)

  useEffect(() => {
    const headings = getHeadings()
    const root = toTree(headings)
    if (root.children.length === 0) {
      return
    }
    useRawTocStore.setState({
      tocList: root.children,
    })
  }, [])

  return tocList
}

function RawToc(
  { className, sx, children, ...props }: BoxProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const tocList = useTocList()

  if (tocList.length === 0) {
    return <></>
  }

  return (
    <Box
      className={clsx('shadow', className)}
      ref={ref}
      sx={{
        p: 1,
        borderRadius: 1,
        backgroundColor: 'background.paper',
        color: 'var(--custom-fg)',
        ...sx,
      }}
      {...props}
    >
      <Typography sx={{ fontWeight: 'bold' }}>目录</Typography>
      <Divider sx={{ my: 1 }} />
      <Box component='ul'>
        {tocList.map((item) => (
          <TocItem key={`${item.depth}-${item.id}`} {...item} />
        ))}
      </Box>
      {children}
    </Box>
  )
}

export const Toc = forwardRef(RawToc)
