'use client'

import { BlogItem } from './BlogItem'

import { Stack, Typography } from '@mui/material'

import type { BlogWithTags } from '@/app/admin/blog/server'

export function BlogList({ blogs }: { blogs: BlogWithTags[] }) {
  if (blogs.length === 0) {
    return <Typography sx={{ py: 2 }}>哪有博客啊，我怎么不知道</Typography>
  }
  return (
    <Stack direction='column' spacing={2}>
      {blogs.map((rec) => (
        <BlogItem key={rec.hash} {...rec} />
      ))}
    </Stack>
  )
}
