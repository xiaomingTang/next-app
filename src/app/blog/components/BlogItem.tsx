'use client'

import { friendlyFormatTime } from '@/utils/formatTime'
import { usePrefersColorSchema } from '@/common/contexts/PrefersColorSchema'

import Link from 'next/link'
import { ButtonBase, Chip, Stack, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'

import type { BlogWithTags } from '@/app/admin/blog/components/server'

// TODO: 美化
// header 跳转路由
// tag 页
// 滚动器加到各个页面(如 /blog 页, 博客内容页 等)
export function BlogItem({
  className,
  ...blog
}: Omit<BlogWithTags, 'content'> & {
  className?: string
}) {
  const { mode } = usePrefersColorSchema()
  return (
    <ButtonBase
      sx={{ width: '100%', textAlign: 'start' }}
      className={className}
    >
      <Link
        href={`/blog/${blog.hash}`}
        style={{ display: 'inline-block', width: '100%' }}
      >
        <Stack
          direction='column'
          spacing={1}
          sx={{
            p: 2,
            borderRadius: 1,
            backgroundColor: mode === 'dark' ? grey[800] : '#ffffff',
            boxShadow: mode === 'dark' ? '0 0 8px #424242' : '0 0 12px #ffffff',
            ':hover': {
              backgroundColor: mode === 'dark' ? grey[700] : grey[100],
              boxShadow:
                mode === 'dark' ? '0 0 8px #616161' : '0 0 12px #f5f5f5',
            },
          }}
        >
          <Typography component='h2'>{blog.title}</Typography>
          <Stack direction='row' spacing={1}>
            <time
              dateTime={friendlyFormatTime(blog.updatedAt)}
              className='mr-2 whitespace-nowrap'
            >
              {friendlyFormatTime(blog.updatedAt)}
            </time>
            {blog.tags.map((tag) => (
              <Chip key={tag.hash} label={tag.name} />
            ))}
          </Stack>
          <Typography>{blog.description}</Typography>
        </Stack>
      </Link>
    </ButtonBase>
  )
}
