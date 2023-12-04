import { useAudio } from '../GlobalAudioPlayer'

import { useListen } from '@/hooks/useListen'
import { dark } from '@/utils/theme'

import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { Slider, IconButton, Stack, alpha } from '@mui/material'
import { common, red } from '@mui/material/colors'
import { forwardRef, useState } from 'react'

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
function RawMP3Controls(_props: {}, ref: React.ForwardedRef<HTMLDivElement>) {
  const { controls, state } = useAudio()
  const [slideValue, setSlideValue] = useState(state.time)
  const [isSlideSetting, setIsSlideSetting] = useState(false)

  useListen(state.time, () => {
    if (!isSlideSetting) {
      setSlideValue(state.time)
    }
  })

  return (
    <Stack
      {..._props}
      ref={ref}
      direction='row'
      spacing={1}
      sx={{
        position: 'relative',
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
          setSlideValue(newValue as number)
          setIsSlideSetting(true)
        }}
        onChangeCommitted={(_, newValue) => {
          controls.seek(newValue as number)
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
      </>
    </Stack>
  )
}

export const MP3Controls = forwardRef(RawMP3Controls)
