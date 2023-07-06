'use client'

import { UrlEditUrlList } from './components/UrlList'
import { useUrlEditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

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
