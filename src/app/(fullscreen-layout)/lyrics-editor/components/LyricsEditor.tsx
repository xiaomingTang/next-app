import { useLyricsEditor } from './store'

import { STYLE } from '@/config'
import { parseLRC } from '@/utils/lrc'

import { Box } from '@mui/material'
import { useMemo } from 'react'

export function LyricsEditor() {
  const lrcContent = useLyricsEditor((state) => state.lrcContent)
  const parsedLrc = useMemo(() => parseLRC(lrcContent), [lrcContent])

  return (
    <Box
      sx={{
        maxWidth: STYLE.width.desktop,
        mx: 'auto',
        p: 2,
      }}
    >
      {parsedLrc.lrcData.length === 0 && '歌词为空'}
      {parsedLrc.lrcData.map((item, index) => (
        <Box
          key={[item.timestamp, item.text, index].join('')}
          sx={{
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          <Box>[{item.timestamp}]</Box>
          <Box>{item.text}</Box>
        </Box>
      ))}
    </Box>
  )
}
