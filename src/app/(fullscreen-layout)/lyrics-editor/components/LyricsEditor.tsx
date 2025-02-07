import { useLyricsEditor } from './store'
import { NoAudio, NoLrc } from './Empty'
import { LyricItemDom } from './LyricItem'

import { LyricItem, sortLyricItems } from '../Lyrics'

import { useListen } from '@/hooks/useListen'
import { STYLE } from '@/config'

import { Box, Divider } from '@mui/material'
import { useState } from 'react'

export function LyricsEditor() {
  const lrcContent = useLyricsEditor((state) => state.lrcContent)
  const [lyricItems, setLyricItems] = useState<LyricItem[]>([])
  const audioUrl = useLyricsEditor((s) => s.audioUrl)

  useListen(lrcContent, () => {
    setLyricItems(
      lrcContent
        .split('\n')
        .filter(Boolean)
        .map((s) => new LyricItem(s))
        .sort(sortLyricItems)
    )
  })

  return (
    <Box
      sx={{
        maxWidth: STYLE.width.desktop,
        mx: 'auto',
        p: 2,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {!audioUrl && (
        <>
          <NoAudio />
          <Divider sx={{ my: 1 }} />
        </>
      )}
      {lyricItems.length === 0 && <NoLrc />}
      {lyricItems.map((item, idx) => (
        <LyricItemDom
          key={[item.type, item.time, item.value].join('-')}
          lyricItem={item}
          onChange={(newItem) => {
            setLyricItems((prev) => {
              const newItems = [...prev]
              newItems[idx] = newItem
              return newItems.sort(sortLyricItems)
            })
          }}
        />
      ))}
    </Box>
  )
}
