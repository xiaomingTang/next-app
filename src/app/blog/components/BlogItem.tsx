'use client'

import { friendlyFormatTime } from '@/utils/formatTime'
import { dark, light } from '@/utils/theme'

import Link from 'next/link'
import { ButtonBase, Chip, Stack, Typography, alpha } from '@mui/material'
import { common, blue } from '@mui/material/colors'

import type { BlogWithTags } from '@/app/admin/blog/server'

function boxShadow(size: 'small' | 'medium', color: string) {
  const sizeMap = {
    small: '8px',
    medium: '12px',
  }
  return `0 0 ${sizeMap[size]} ${color}`
}

export function BlogItem({
  className,
  ...blog
}: Omit<BlogWithTags, 'content'> & {
  className?: string
}) {
  return (
    <ButtonBase
      sx={{
        p: 2,
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
      }}
      className={className}
      LinkComponent={Link}
      href={`/blog/${blog.hash}`}
      aria-label={`${friendlyFormatTime(blog.updatedAt)}更新的博客《${
        blog.title
      }》；简介是：${blog.description}`}
    >
      <Stack direction='column' spacing={1} sx={{ width: '100%' }} aria-hidden>
        <Typography component='h2' sx={{ fontWeight: 'bold' }}>
          {blog.title}
        </Typography>
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
          {blog.description}
        </Typography>
        <Stack direction='row' alignItems='center' spacing={1} fontSize='0.8em'>
          <Typography
            component='time'
            dateTime={friendlyFormatTime(blog.updatedAt)}
            sx={{ color: 'InactiveCaptionText' }}
          >
            {friendlyFormatTime(blog.updatedAt)}
          </Typography>
          {blog.tags.map((tag) => (
            <Chip key={tag.hash} label={tag.name} />
          ))}
        </Stack>
      </Stack>
    </ButtonBase>
  )
}
