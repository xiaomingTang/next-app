'use client'

import { BLOG_MARKDOWN_ID } from './constants'
import { encodeToId } from './markdownComponents'

import { Box, Divider, Link, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

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
  const headingInfos = headings.map<HeadingTree>((h) => ({
    text: h.innerText,
    id: encodeToId(h.innerText),
    depth: +h.tagName.slice(1),
    children: [],
  }))
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

export function Toc() {
  const [element, setElement] = useState(<></>)

  useEffect(() => {
    const headings = getHeadings()
    const root = toTree(headings)
    if (root.children.length === 0) {
      return
    }
    setElement(
      <Box
        component='ul'
        className='shadow'
        sx={{
          mt: 1,
          p: 1,
          borderRadius: 1,
          background: (theme) => theme.palette.background.paper,
        }}
      >
        <Typography sx={{ fontWeight: 'bold' }}>目录</Typography>
        <Divider sx={{ my: 1 }} />
        {root.children.map((item) => (
          <TocItem key={`${item.depth}-${item.id}`} {...item} />
        ))}
      </Box>
    )
  }, [])

  return element
}
