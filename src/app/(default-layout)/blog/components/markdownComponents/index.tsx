'use client'

import { geneHeading } from './MdHead'
import { MdIframe } from './MdIframe'
import { MdVideo } from './MdVideo'
import { MdPre } from './MdPre'

import Anchor from '@/components/Anchor'
import { ImageWithState } from '@/components/ImageWithState'
import { onAnchorClick } from '@/components/Anchor/utils'

import { Button } from '@mui/material'

import type { MDXComponents } from 'mdx/types'

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
  pre: MdPre,
  Video: MdVideo,
  Iframe: MdIframe,
}
