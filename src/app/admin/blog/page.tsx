'use client'

import { BlogEditorBlogList } from './components/BlogList'
import { useBlogEditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

// markdown editor
// https://stackedit.io/app#origin=https://benweet.github.io&fileName=MarkdownWithStackEdit&contentText=Hello

export default function BlogEditor() {
  const { data: blogs, elem: BlogEditorSearchBar } = useBlogEditorSearchBar()

  return (
    <Box>
      {BlogEditorSearchBar}
      <BlogEditorBlogList blogs={blogs} />
    </Box>
  )
}
