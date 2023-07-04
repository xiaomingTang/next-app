'use client'

import { BlogItem } from './BlogItem'

import { Stack } from '@mui/material'

import type { BlogWithTags } from '@/app/admin/blog/components/server'

export function BlogList({ blogs }: { blogs: BlogWithTags[] }) {
  return (
    <Stack direction='column' spacing={2}>
      {blogs.map((rec) => (
        <BlogItem key={rec.hash} {...rec} />
      ))}
    </Stack>
  )
}
