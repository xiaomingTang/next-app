'use client'

import { BlogContent } from './BlogContent'
import { CommentArea } from './CommentArea'

import { formatTime, friendlyFormatTime } from '@/utils/transformer'
import { ScrollToTop } from '@/components/ScrollToTop'
import { TagItem } from '@D/tag/components/TagItem'
import { shuffledArray7 } from '@/constants'
import Span from '@/components/Span'

import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { JsonLd } from 'react-schemaorg'

import type { Article } from 'schema-dts'
import type { LoadingAble } from '@/components/ServerComponent'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { BlogWithTags } from '@ADMIN/blog/server'

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
      }}
    >
      {step === 0 && `更新于 ${friendlyFormatTime(blog.updatedAt)}`}
      {step === 1 && `更新于 ${formatTime(blog.updatedAt)}`}
      {step === 2 && `发布于 ${formatTime(blog.createdAt)}`}
    </Typography>
  )
}

type BlogContentProps = LoadingAble<
  BlogWithTags & {
    source: MDXRemoteSerializeResult
  }
>

export function BlogPage(blog: BlogContentProps) {
  const [wordCount, setWordCount] = useState(0)
  const spendTimeStr = `约 ${wordCount} 字, 预计耗时 ${Math.max(1, Math.ceil(wordCount / 400))} 分钟`

  return (
    <ScrollToTop>
      {!blog.loading && (
        <JsonLd<Article>
          item={{
            '@context': 'https://schema.org',
            '@type': 'Article',
            name: blog.title,
            headline: blog.title,
            datePublished: blog.createdAt.toISOString(),
            dateModified: blog.updatedAt.toISOString(),
            author: [
              {
                '@type': 'Person',
                name: 'xiaoming',
                url: 'https://github.com/xiaomingTang',
              },
            ],
          }}
        />
      )}

      {/* meta: time & tags */}
      <Stack
        spacing={1}
        direction='row'
        useFlexGap
        flexWrap='wrap'
        sx={{
          mb: 1,
          color: 'text.secondary',
          fontSize: '0.825rem',
        }}
      >
        {blog.loading ? (
          <Skeleton width='18em' height={16 * 0.825 * 1.5} />
        ) : (
          <Time blog={blog} />
        )}
        {wordCount > 0 && (
          <Span
            aria-label={spendTimeStr}
            sx={{
              display: 'inline-block',
            }}
          >
            {spendTimeStr}
          </Span>
        )}
      </Stack>
      <Box sx={{ mb: 1 }}>
        {blog.loading ? (
          <>
            {shuffledArray7.slice(0, 2).map((n, i) => (
              <TagItem key={i} loading size={n} sx={{ mr: 1, mb: 1 }} />
            ))}
          </>
        ) : (
          blog.tags.map((tag) => (
            <TagItem {...tag} key={tag.hash} sx={{ mr: 1, mb: 1 }} />
          ))
        )}
      </Box>
      {/* content */}
      <BlogContent
        {...blog}
        mode='production'
        ref={(elem) => {
          const text = elem?.innerText ?? ''
          const simpleStr = text.replace(/[^a-zA-Z0-9]/g, '')
          const cnStr = text.replace(/[^\u4e00-\u9fa5]/g, '')
          setWordCount(Math.ceil(simpleStr.length / 3 + cnStr.length))
        }}
      />
      <Box sx={{ mt: 2, pointerEvents: 'none' }} aria-hidden />
      {!blog.loading && <CommentArea blog={blog} />}
    </ScrollToTop>
  )
}
