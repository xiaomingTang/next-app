'use client'

import { UrlEditUrlList } from './components/UrlList'
import { useUrlEditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

// markdown editor
// https://stackedit.io/app#origin=https://benweet.github.io&fileName=MarkdownWithStackEdit&contentText=Hello

export default function UrlEditor() {
  const {
    data: urls,
    elem: UrlEditorSearchBar,
    search,
  } = useUrlEditorSearchBar()

  return (
    <Box>
      {UrlEditorSearchBar}
      <UrlEditUrlList urls={urls} onChange={search} />
    </Box>
  )
}
