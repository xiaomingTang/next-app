'use client'

import { formatTime, friendlyFormatTime } from '@/utils/formatTime'
import Anchor from '@/components/Anchor'

import { MDXRemote } from 'next-mdx-remote'
import { Box, Button, Chip, Stack, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import Link from 'next/link'

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
        cursor: 'pointer',
        userSelect: 'none',
        color: 'InactiveCaptionText',
        fontSize: '0.9em',
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
    <Box>
      <Stack direction='column' spacing={1} sx={{ mb: 2 }}>
        <Time blog={blog} />
        <Stack direction='row' spacing={1}>
          {blog.tags.map((tag) => (
            <Tooltip
              key={tag.hash}
              title={tag.description}
              placement='bottom-start'
            >
              <Chip label={tag.name} size='small' color='primary' />
            </Tooltip>
          ))}
        </Stack>
      </Stack>
      <Typography
        component='article'
        className='markdown-body'
        sx={{
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
        }}
      >
        <Typography
          component='h1'
          sx={{
            textAlign: 'center',
            fontSize: '2em',
            fontWeight: 'bold',
          }}
        >
          {blog.title}
        </Typography>
        <MDXRemote {...source} components={components} />
      </Typography>
    </Box>
  )
}
