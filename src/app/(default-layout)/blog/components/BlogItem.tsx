'use client'

import { friendlyFormatTime } from '@/utils/formatTime'
import { dark } from '@/utils/theme'
import { Link } from '@/components/CustomLink'
import { obj } from '@/utils/tiny'
import { useListen } from '@/hooks/useListen'

import {
  ButtonBase,
  Chip,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { common, blue } from '@mui/material/colors'
import { useRef } from 'react'

import type { LoadingAble } from '@/components/ServerComponent'
import type { BlogWithTags } from '@ADMIN/blog/server'
import type { SxProps, Theme } from '@mui/material'

function boxShadow(size: 'small' | 'medium', color: string) {
  const sizeMap = {
    small: '8px',
    medium: '12px',
  }
  return `0 0 ${sizeMap[size]} ${color}`
}

export type BlogItemProps = LoadingAble<Omit<BlogWithTags, 'content'>> & {
  sx?: SxProps<Theme>
  selected?: boolean
  /**
   * 用于在 BlogList 过多的时候标记 index
   */
  index?: number | false
}

function BlogTitle(blog: BlogItemProps) {
  if (blog.loading) {
    return <Skeleton width={`${blog.size * 10}%`} height={24} />
  }
  return (
    <Typography component='h2' sx={{ fontWeight: 'bold' }}>
      {Number.isInteger(blog.index) && (
        <Typography
          component='span'
          sx={{
            fontWeight: 'normal',
            fontSize: '0.8em',
            opacity: 0.6,
            pointerEvents: 'none',
          }}
        >
          {blog.index}：
        </Typography>
      )}
      {blog.title}
    </Typography>
  )
}

function BlogDesc(blog: BlogItemProps) {
  return (
    <Typography
      sx={{
        backgroundColor: alpha(common.black, 0.025),
        [dark()]: {
          backgroundColor: alpha(common.white, 0.025),
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
      sx={{ color: 'text.secondary' }}
    >
      {blog.loading ? (
        <Skeleton width={16 * 5} height={20} />
      ) : (
        friendlyFormatTime(blog.updatedAt)
      )}
    </Typography>
  )
}

export function BlogItem({ sx, selected, ...blog }: BlogItemProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const blogDescAriaLabel = blog.loading
    ? '加载中'
    : `${friendlyFormatTime(blog.updatedAt)}更新的博客《${
        blog.title
      }》；简介是：${blog.description}`

  useListen(selected, () => {
    if (selected) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }
  })

  return (
    <ButtonBase
      ref={ref}
      LinkComponent={Link}
      disabled={blog.loading}
      href={blog.loading ? '/' : `/blog/${blog.hash}`}
      aria-label={blogDescAriaLabel}
      role={blog.loading ? 'none' : undefined}
      sx={{
        p: 2,
        width: '100%',
        textAlign: 'start',
        borderRadius: 1,
        ':focus-visible': {
          outline: `1px solid ${blue[700]}`,
        },
        ...obj(
          selected && {
            outline: `1px solid ${blue[700]}`,
          }
        ),
        backgroundColor: common.white,
        boxShadow: boxShadow('small', common.white),
        ':hover': {
          backgroundColor: alpha(blue[100], 0.66),
          boxShadow: boxShadow('medium', alpha(blue[100], 0.66)),
        },
        [dark()]: {
          backgroundColor: alpha(common.black, 0.55),
          boxShadow: boxShadow('small', alpha(common.black, 0.55)),
          ':hover': {
            backgroundColor: alpha(common.black, 0.35),
            boxShadow: boxShadow('medium', alpha(common.black, 0.35)),
          },
        },
        ...sx,
      }}
    >
      <Stack direction='column' spacing={1} sx={{ width: '100%' }} aria-hidden>
        <BlogTitle {...blog} />
        <BlogDesc {...blog} />
        <Stack
          direction='row'
          alignItems='center'
          spacing={1}
          fontSize='0.8em'
          useFlexGap
          flexWrap='wrap'
        >
          <BlogTime {...blog} />
          {(blog.tags ?? []).map((tag) => (
            <Chip key={tag.hash} label={tag.name} />
          ))}
        </Stack>
      </Stack>
    </ButtonBase>
  )
}
