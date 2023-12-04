'use client'

import { useLyricsViewer } from './context'
import { useHasShown, useLyrics } from './utils'
import { MP3Controls } from './MP3Controls'

import { useAudio } from '../GlobalAudioPlayer'
import { SlideUpTransition } from '../SlideUpTransition'

import { dark } from '@/utils/theme'
import { useListen } from '@/hooks/useListen'
import { obj } from '@/utils/tiny'

import {
  Box,
  ButtonBase,
  ClickAwayListener,
  Fade,
  Stack,
  alpha,
} from '@mui/material'
import { useState } from 'react'
import { common, red } from '@mui/material/colors'

import type { SxProps, Theme } from '@mui/material'

export function LyricsViewer() {
  const { state, activeMP3 } = useAudio()
  const visible = useLyricsViewer((s) => s.visible)
  const hasShown = useHasShown(visible)
  const [controlsVisible, setControlsVisible] = useState(false)

  const { activeLyricsItem } = useLyrics({
    enabled: hasShown,
    mp3: activeMP3,
    playingTime: state.time,
  })

  useListen(visible, () => {
    if (visible && !hasShown) {
      setControlsVisible(true)
      window.setTimeout(() => {
        setControlsVisible(false)
      }, 2000)
    }
  })

  const lyricsSx: SxProps<Theme> = {
    pointerEvents: 'auto',
    position: 'relative',
    padding: '4px',
    maxWidth: '100%',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: '1px',
    fontSize: '20px',
    borderRadius: 1,
    cursor: 'pointer',

    backdropFilter: 'blur(4px)',
    color: red[500],
    backgroundColor: alpha(common.white, 0.7),
    [dark()]: {
      color: red[500],
      backgroundColor: alpha(common.black, 0.7),
    },

    ':focus': obj(
      controlsVisible && {
        outline: `1px solid ${red[500]}`,
      }
    ),
    ':focus-visible': {
      outline: `1px solid ${red[500]}`,
    },
  }

  const progressSx: SxProps<Theme> = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  }

  const progressBar = (
    <Box component='svg' sx={progressSx}>
      {!controlsVisible && (
        <g>
          <rect
            width='100%'
            stroke='none'
            fill={red[100]}
            y='100%'
            height={2}
            style={{ transform: 'translateY(-2px)' }}
          />
          <rect
            width={`${(state.time / state.duration) * 100}%`}
            stroke='none'
            fill={red[500]}
            y='100%'
            height={2}
            style={{ transform: 'translateY(-2px)' }}
          />
        </g>
      )}
    </Box>
  )

  if (globalThis.mp3s.length === 0) {
    return <></>
  }

  return (
    // unmountOnExit 是用于使其内的 Button autoFocus 生效，不能移除
    <SlideUpTransition in={visible} unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          zIndex: (theme) => theme.zIndex.fab,
          bottom: '0.5em',
          left: '0',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        <ClickAwayListener onClickAway={() => setControlsVisible(false)}>
          <Stack
            direction='column'
            spacing={1}
            sx={{
              alignItems: 'center',
              width: 'calc(100% - 32px)',
              maxWidth: '560px',
              ml: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            {/* 控制条 */}
            <Fade in={controlsVisible}>
              <MP3Controls />
            </Fade>
            {/* 标题 / 歌词 */}
            <ButtonBase
              autoFocus
              onClick={() => setControlsVisible((prev) => !prev)}
              sx={lyricsSx}
            >
              {activeLyricsItem.text}
              {progressBar}
            </ButtonBase>
          </Stack>
        </ClickAwayListener>
      </Box>
    </SlideUpTransition>
  )
}
