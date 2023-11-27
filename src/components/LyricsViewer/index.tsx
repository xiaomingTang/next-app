'use client'

import { useLyricsViewer } from './context'

import { useAudio } from '../GlobalAudioPlayer'
import { SlideUpTransition } from '../SlideUpTransition'

import { parseLRC } from '@/utils/lrc'
import { useListen } from '@/hooks/useListen'

import {
  Box,
  IconButton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import useSWR from 'swr'
import { useMemo, useState } from 'react'
import { common } from '@mui/material/colors'

export function LyricsViewer() {
  const theme = useTheme()
  const { controls, state, activeMP3 } = useAudio()
  const visible = useLyricsViewer((s) => s.visible)
  const [isBeforeInit, setIsBeforeInit] = useState(true)
  const {
    data: lyricsString = '',
    error: lyricsError,
    isValidating: lyricsLoading,
  } = useSWR<string, Error>(['lrc', activeMP3?.lrc, isBeforeInit], async () => {
    // 从没打开过歌词的，不加载歌词
    if (isBeforeInit) {
      return ''
    }
    if (!activeMP3?.lrc) {
      throw new Error('没有歌词')
    }
    return fetch(activeMP3.lrc)
      .then((res) => res.text())
      .catch(() => {
        throw new Error('网络错误，请稍后重试')
      })
  })
  const lyrics = useMemo(() => parseLRC(lyricsString), [lyricsString])
  useListen(visible, () => {
    if (visible) {
      setIsBeforeInit(false)
    }
  })

  const text = useMemo(() => {
    if (!activeMP3) {
      return '-'
    }
    if (lyricsLoading) {
      return `${activeMP3.name} - [加载中]`
    }
    if (lyricsError) {
      return `${activeMP3.name} - [${lyricsError.message || '未知错误'}]`
    }
    if (lyrics.lrcData.length === 0) {
      return `${activeMP3.name} - [没有歌词]`
    }
    // 保证歌曲标题至少展示 1.5s
    if (state.time < 1.5) {
      return activeMP3.name
    }
    return (
      lyrics.lrcData.toReversed().find((item) => item.timestamp <= state.time)
        ?.text ?? activeMP3.name
    )
  }, [activeMP3, lyrics, lyricsError, lyricsLoading, state.time])

  if (mp3s.length === 0) {
    return <></>
  }

  return (
    <SlideUpTransition in={visible}>
      <Box
        sx={{
          position: 'fixed',
          zIndex: theme.zIndex.fab,
          bottom: '0.5em',
          left: '0',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        <Stack
          direction='row'
          spacing={1}
          sx={{
            pointerEvents: 'auto',
            alignItems: 'center',
            width: 'calc(100% - 32px)',
            maxWidth: '500px',
            ml: '50%',
            pl: 1,
            transform: 'translateX(-50%)',
            borderRadius: 1,
            backgroundColor: alpha(common.white, 0.6),
            backdropFilter: 'blur(8px)',
            boxShadow: theme.shadows[10],
          }}
        >
          {/* 标题 / 歌词 */}
          <Typography flex='1 1 auto' noWrap variant='h3' fontWeight='bold'>
            {text}
          </Typography>
          {/* 控制 */}
          <Stack direction='row' spacing={1} flex='0 0 auto'>
            <IconButton
              onClick={() => {
                controls.prev()
                window.setTimeout(() => {
                  controls.play()
                }, 0)
              }}
            >
              <SkipPreviousIcon />
            </IconButton>
            <IconButton onClick={controls.togglePlay}>
              {state.paused ? <PlayArrowIcon /> : <PauseIcon />}
            </IconButton>
            <IconButton
              onClick={() => {
                controls.next()
                window.setTimeout(() => {
                  controls.play()
                }, 0)
              }}
            >
              <SkipNextIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </SlideUpTransition>
  )
}
