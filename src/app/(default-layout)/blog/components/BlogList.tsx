'use client'

import { BlogItem } from './BlogItem'

import { shuffledArray7 } from '@/constants'

import { Stack, Typography } from '@mui/material'

import type { BlogWithTags } from '@ADMIN/blog/server'

interface BlogListProps {
  blogs: BlogWithTags[]
  selectedIndex?: number
}

export function BlogList({ blogs, selectedIndex }: BlogListProps) {
  if (blogs.length === 0) {
    return <Typography>哪有博客啊，我怎么不知道</Typography>
  }
  return (
    <Stack direction='column' spacing={2}>
      {blogs.map((rec, i) => (
        <BlogItem selected={selectedIndex === i} {...rec} key={rec.hash} />
      ))}
    </Stack>
  )
}

export function BlogListLoading({ count }: { count: number }) {
  return (
    <Stack direction='column' spacing={2}>
      {shuffledArray7.slice(0, count).map((n, i) => (
        <BlogItem key={i} loading size={n} />
      ))}
    </Stack>
  )
}
