'use client'

import { formatTime, friendlyFormatTime } from '@/utils/formatTime'
import Anchor from '@/components/Anchor'
import { ScrollToTop } from '@/components/ScrollToTop'

import { MDXRemote } from 'next-mdx-remote'
import { Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { MDXComponents } from 'mdx/types'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { BlogWithTags } from '@/app/admin/blog/components/server'

import './styles/markdown-overrides.scss'

const components: MDXComponents = {
  Button,
  a: (props) => (
    <Link href={props.href || '.'} passHref legacyBehavior>
      <Anchor {...props} ref={null} />
    </Link>
  ),
  // TODO: preview
  // TODO: 仅支持的域才使用 next/image
  img: (props) => (
    <Image
      src={props.src ?? '/pwa/android-chrome-512x512.png'}
      width={512}
      height={512}
      alt={props.alt ?? ''}
    />
  ),
}

function Time({ blog }: { blog: BlogWithTags }) {
  const [step, setStep] = useState(0)

  return (
    <Typography
      component='time'
      onClick={() => {
        setStep((prev) => (prev + 1) % 3)
      }}
      sx={{
        display: 'inline-block',
        cursor: 'pointer',
        userSelect: 'none',
        color: 'InactiveCaptionText',
        fontSize: '0.825rem',
      }}
    >
      {step === 0 && `更新于 ${friendlyFormatTime(blog.updatedAt)}`}
      {step === 1 && `更新于 ${formatTime(blog.updatedAt)}`}
      {step === 2 && `发布于 ${formatTime(blog.createdAt)}`}
    </Typography>
  )
}

export function BlogContent({
  source,
  ...blog
}: BlogWithTags & {
  source: MDXRemoteSerializeResult
}) {
  return (
    <ScrollToTop>
      {/* 标题 */}
      <Typography
        component='h1'
        sx={{
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
        }}
      >
        {blog.title}
      </Typography>
      {/* meta: time & tags */}
      <Stack direction='column' spacing={1} sx={{ mb: 2 }}>
        <Box>
          <Time blog={blog} />
        </Box>
        <Stack direction='row' spacing={1}>
          {blog.tags.map((tag) => (
            <Tooltip key={tag.hash} title={tag.description}>
              <Chip label={tag.name} />
            </Tooltip>
          ))}
        </Stack>
      </Stack>
      {/* content */}
      <Typography
        component='article'
        className='markdown-body'
        sx={{
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
        }}
      >
        <MDXRemote {...source} components={components} />
      </Typography>
    </ScrollToTop>
  )
}
