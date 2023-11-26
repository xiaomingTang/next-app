'use client'

import { MP3EditMP3List } from './components/MP3List'
import { useMP3EditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

export default function MP3Editor() {
  const {
    data: mp3s,
    elem: MP3EditorSearchBar,
    search,
  } = useMP3EditorSearchBar()

  return (
    <Box>
      {MP3EditorSearchBar}
      <MP3EditMP3List mp3s={mp3s} onChange={search} />
    </Box>
  )
}
