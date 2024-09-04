'use client'

import { BlogEditorBlogList } from './components/BlogList'
import { useBlogEditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

export default function BlogEditor() {
  const {
    data: blogs,
    elem: BlogEditorSearchBar,
    search,
  } = useBlogEditorSearchBar()

  return (
    <Box>
      {BlogEditorSearchBar}
      <BlogEditorBlogList blogs={blogs} onChange={search} />
    </Box>
  )
}
