import { RepeatTrigger } from './RepeatTrigger'
import { MusicListTrigger } from './MusicListTrigger'

import { useGlobalAudio } from '../useGlobalAudio'

import { useListen } from '@/hooks/useListen'
import { dark } from '@/utils/theme'

import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { Slider, IconButton, Box, alpha, Divider } from '@mui/material'
import { common, red } from '@mui/material/colors'
import { useState } from 'react'

function ps(n: number) {
  return n.toString().padStart(2, '0')
}

function timeFormat(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec) % 60

  if (h > 0) {
    return `${ps(h)}:${ps(m)}:${ps(s)}`
  }
  return `${ps(m)}:${ps(s)}`
}

/**
 * _props: {} 必须要: MUI Fade 等组件要传东西下来
 */
export function MP3Controls(_props: {}) {
  const { controls, state } = useGlobalAudio()
  const [slideValue, setSlideValue] = useState(state.time)
  const [isSlideSetting, setIsSlideSetting] = useState(false)

  useListen(state.time, () => {
    if (!isSlideSetting) {
      setSlideValue(state.time)
    }
  })

  return (
    <Box
      {..._props}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 1,
        pointerEvents: 'auto',

        backdropFilter: 'blur(4px)',
        color: red[500],
        backgroundColor: alpha(common.white, 0.7),
        [dark()]: {
          color: red[500],
          backgroundColor: alpha(common.black, 0.7),
        },
      }}
    >
      {/* 歌曲进度条 */}
      <Slider
        size='small'
        aria-label='歌曲进度条'
        valueLabelDisplay='auto'
        valueLabelFormat={timeFormat}
        value={slideValue}
        onChange={(_, newValue) => {
          setSlideValue(newValue)
          setIsSlideSetting(true)
        }}
        onChangeCommitted={(_, newValue) => {
          controls.seek(newValue)
          setIsSlideSetting(false)
        }}
        step={1}
        min={0}
        max={state.duration}
        sx={{
          position: 'absolute',
          width: '100%',
          top: 0,
          left: 0,
          transform: 'translateY(-50%)',
          color: red[500],
        }}
      />
      {/* 上一曲、播放、下一曲 */}
      <>
        <RepeatTrigger />
        <Divider orientation='vertical' sx={{ height: '1.5em', mx: 1 }} />
        <IconButton
          onClick={() => {
            controls.prev()
            void controls.play()
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
            void controls.play()
          }}
        >
          <SkipNextIcon />
        </IconButton>
        <Divider orientation='vertical' sx={{ height: '1.5em', mx: 1 }} />
        <MusicListTrigger />
      </>
    </Box>
  )
}
