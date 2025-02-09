import { useLyricsEditor, useLyricsEditorAudio } from './store'
import { NoAudio, NoLrc } from './Empty'
import { LyricItemDom } from './LyricItem'

import { STYLE } from '@/config'

import { Box, Divider } from '@mui/material'
import { useRef, useState } from 'react'

import type { LyricItem } from '../Lyrics'

function getPlayingPercent(
  curTime: number,
  duration: number,
  theItem: LyricItem,
  nextItem?: LyricItem
) {
  const nextTime = nextItem?.time ?? duration
  if (theItem.type !== 'lyric') return 1
  if (duration === 0) return -1
  if (curTime >= nextTime) return 1
  if (curTime < theItem.time) return -1
  return (curTime - theItem.time) / (nextTime - theItem.time)
}

export function LyricsEditor() {
  const lrcItems = useLyricsEditor((state) => state.lrcItems)
  const audioUrl = useLyricsEditor((s) => s.audioUrl)
  const curTime = useLyricsEditorAudio((s) => s.state.time)
  const duration = useLyricsEditorAudio((s) => s.state.duration)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimerRef = useRef<number>(-1)

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
      onScroll={() => {
        setIsScrolling(true)
        window.clearTimeout(scrollTimerRef.current)
        scrollTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false)
        }, 2000)
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
          isScrolling={isScrolling}
          playingPercent={getPlayingPercent(
            curTime,
            duration,
            item,
            lrcItems[idx + 1]
          )}
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
