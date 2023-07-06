'use client'

import { TagEditTagList } from './components/TagList'
import { useTagEditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

export default function TagEditor() {
  const {
    data: tags,
    elem: TagEditorSearchBar,
    search,
  } = useTagEditorSearchBar()

  return (
    <Box>
      {TagEditorSearchBar}
      <TagEditTagList tags={tags} onChange={search} />
    </Box>
  )
}
