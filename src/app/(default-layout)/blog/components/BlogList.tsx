import { BlogItem } from './BlogItem'

import { shuffledArray7 } from '@/constants'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

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
      {blogs.map((blog, i) => (
        <BlogItem
          selected={selectedIndex === i}
          {...blog}
          key={blog.hash}
          index={blogs.length > 4 && i + 1}
        />
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
