import { useLyricsEditor } from './store'
import { NoAudio, NoLrc } from './Empty'
import { LyricItemDom } from './LyricItem'

import { STYLE } from '@/config'

import { Box, Divider } from '@mui/material'

export function LyricsEditor() {
  const lrcItems = useLyricsEditor((state) => state.lrcItems)
  const audioUrl = useLyricsEditor((s) => s.audioUrl)

  return (
    <Box
      sx={{
        maxWidth: STYLE.width.desktop,
        mx: 'auto',
        p: 2,
        height: '100%',
        overflowY: 'auto',
      }}
      onDoubleClick={() => {
        useLyricsEditor.insertLrc(99999999, { value: '' })
      }}
    >
      {!audioUrl && (
        <>
          <NoAudio />
          <Divider sx={{ my: 1 }} />
        </>
      )}
      {lrcItems.length === 0 && <NoLrc />}
      {lrcItems.map((item, idx) => (
        <LyricItemDom
          key={[item.type, item.time, item.value, idx].join('-')}
          lyricItem={item}
          onChange={(newItem) => {
            useLyricsEditor.updateItem(idx, newItem)
          }}
          onDelete={() => {
            useLyricsEditor.deleteLrcItem(idx)
          }}
          onInsertBefore={(item) => {
            useLyricsEditor.insertLrc(idx, item ?? { value: '' })
          }}
          onInsertAfter={(item) => {
            useLyricsEditor.insertLrc(idx + 1, item ?? { value: '' })
          }}
        />
      ))}
    </Box>
  )
}
