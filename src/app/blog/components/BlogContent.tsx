'use client'

import './styles/markdown-overrides.scss'

import { markdownComponents } from './markdownComponents'

import { formatTime, friendlyFormatTime } from '@/utils/formatTime'
import { ScrollToTop } from '@/components/ScrollToTop'
import { BlogTypeMap } from '@/app/admin/blog/components/constants'
import { useUser } from '@/user'
import { TagItem } from '@/app/tag/components/TagItem'
import { SvgLoading } from '@/svg'
import { editBlog } from '@/app/admin/blog/components/EditBlog'
import { cat } from '@/errors/catchAndToast'

import { MDXRemote } from 'next-mdx-remote'
import { Alert, Box, IconButton, NoSsr, Typography } from '@mui/material'
import { useState } from 'react'
import { BlogType } from '@prisma/client'
import BorderColorIcon from '@mui/icons-material/BorderColor'

import type { LoadingAble } from '@/components/ServerComponent'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import type { BlogWithTags } from '@/app/admin/blog/server'

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

type BlogContentProps = LoadingAble<
  BlogWithTags & {
    source: MDXRemoteSerializeResult
  }
>

export function BlogContent(blog: BlogContentProps) {
  const user = useUser()

  if (blog.loading) {
    return (
      <Alert icon={<SvgLoading className='animate-spin' />} color='warning'>
        加载中...
      </Alert>
    )
  }

  return (
    <ScrollToTop>
      {/* meta: time & tags */}
      <Box sx={{ mb: 1 }}>
        <Time blog={blog} />
      </Box>
      <Box>
        {blog.tags.map((tag) => (
          <TagItem key={tag.hash} {...tag} sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>
      {/* content */}
      <Typography
        component='article'
        className='markdown-body'
        sx={{
          p: 2,
          mt: 1,
          borderRadius: 1,
          overflow: 'auto',
        }}
      >
        {/* 标题 */}
        <Typography
          component='h1'
          sx={{
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
        >
          {blog.type === BlogType.UNPUBLISHED && (
            <>{BlogTypeMap[blog.type].name} </>
          )}
          {blog.title}
          <NoSsr>
            {blog.creator.id === user.id && (
              <IconButton
                color='primary'
                sx={{ verticalAlign: 'baseline', float: 'right' }}
                aria-label='编辑该博客'
                onClick={cat(() => editBlog(blog))}
              >
                <BorderColorIcon />
              </IconButton>
            )}
          </NoSsr>
        </Typography>
        <MDXRemote {...blog.source} components={markdownComponents} />
      </Typography>
    </ScrollToTop>
  )
}
