'use client'

import { friendlyFormatTime } from '@/utils/formatTime'
import { dark, light } from '@/utils/theme'

import {
  ButtonBase,
  Chip,
  Link,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { common, blue } from '@mui/material/colors'

import type { LoadingAble } from '@/components/ServerComponent'
import type { BlogWithTags } from '@/app/admin/blog/server'
import type { SxProps, Theme } from '@mui/material'

function boxShadow(size: 'small' | 'medium', color: string) {
  const sizeMap = {
    small: '8px',
    medium: '12px',
  }
  return `0 0 ${sizeMap[size]} ${color}`
}

type BlogItemProps = LoadingAble<Omit<BlogWithTags, 'content'>> & {
  sx?: SxProps<Theme>
}

function BlogTitle(blog: BlogItemProps) {
  if (blog.loading) {
    return <Skeleton width={`${blog.size * 10}%`} height={24} />
  }
  return (
    <Typography component='h2' sx={{ fontWeight: 'bold' }}>
      {blog.title}
    </Typography>
  )
}

function BlogDesc(blog: BlogItemProps) {
  return (
    <Typography
      sx={{
        [dark()]: {
          backgroundColor: alpha(common.white, 0.025),
        },
        [light()]: {
          backgroundColor: alpha(common.black, 0.025),
        },
        p: 1,
        borderRadius: 1,
        fontSize: '0.8em',
      }}
    >
      {blog.loading ? (
        <>
          <Skeleton width='100%' height={20} />
          <Skeleton width={`${blog.size * 10}%`} height={20} />
        </>
      ) : (
        blog.description
      )}
    </Typography>
  )
}

function BlogTime(blog: BlogItemProps) {
  return (
    <Typography
      component='time'
      dateTime={blog.loading ? '' : friendlyFormatTime(blog.updatedAt)}
      sx={{ color: 'InactiveCaptionText' }}
    >
      {blog.loading ? (
        <Skeleton width={16 * 5} height={20} />
      ) : (
        friendlyFormatTime(blog.updatedAt)
      )}
    </Typography>
  )
}

export function BlogItem({ sx, ...blog }: BlogItemProps) {
  const blogDescAriaLabel = blog.loading
    ? '加载中'
    : `${friendlyFormatTime(blog.updatedAt)}更新的博客《${
        blog.title
      }》；简介是：${blog.description}`

  return (
    <ButtonBase
      sx={{
        p: 2,
        width: '100%',
        textAlign: 'start',
        borderRadius: 1,
        ':focus-visible': {
          outline: `1px solid ${blue[700]}`,
        },
        [dark()]: {
          backgroundColor: alpha(common.black, 0.55),
          boxShadow: boxShadow('small', alpha(common.black, 0.55)),
          ':hover': {
            backgroundColor: alpha(common.black, 0.35),
            boxShadow: boxShadow('medium', alpha(common.black, 0.35)),
          },
        },
        [light()]: {
          backgroundColor: common.white,
          boxShadow: boxShadow('small', common.white),
          ':hover': {
            backgroundColor: alpha(blue[100], 0.66),
            boxShadow: boxShadow('medium', alpha(blue[100], 0.66)),
          },
        },
        ...sx,
      }}
      LinkComponent={Link}
      disabled={blog.loading}
      href={blog.loading ? '/' : `/blog/${blog.hash}`}
      aria-label={blogDescAriaLabel}
      role={blog.loading ? 'none' : undefined}
    >
      <Stack direction='column' spacing={1} sx={{ width: '100%' }} aria-hidden>
        <BlogTitle {...blog} />
        <BlogDesc {...blog} />
        <Stack direction='row' alignItems='center' spacing={1} fontSize='0.8em'>
          <BlogTime {...blog} />
          {(blog.tags ?? []).map((tag) => (
            <Chip key={tag.hash} label={tag.name} />
          ))}
        </Stack>
      </Stack>
    </ButtonBase>
  )
}
