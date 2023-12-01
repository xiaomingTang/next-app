'use client'

import { useLyricsViewer } from './context'
import { useControlsVisible, useHasShown, useLyrics } from './utils'

import { useAudio } from '../GlobalAudioPlayer'
import { SlideUpTransition } from '../SlideUpTransition'

import {
  Box,
  Fade,
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
import { useHoverDirty } from 'react-use'
import { useRef } from 'react'
import { common } from '@mui/material/colors'

export function LyricsViewer() {
  const theme = useTheme()
  const { controls, state, activeMP3 } = useAudio()
  const visible = useLyricsViewer((s) => s.visible)
  const hasShown = useHasShown(visible)
  const controlsRef = useRef(null)
  const textRef = useRef(null)
  const isHoveringControls = useHoverDirty(controlsRef)
  const isHoveringText = useHoverDirty(textRef)
  const isHovering = isHoveringControls || isHoveringText
  const controlsVisible = useControlsVisible(visible, isHovering)

  const {
    activeLyricsItem: { text },
  } = useLyrics({
    enabled: hasShown,
    mp3: activeMP3,
    playingTime: state.time,
  })

  if (globalThis.mp3s.length === 0) {
    return <></>
  }

  return (
    <SlideUpTransition in={visible}>
      <Box
        sx={{
          position: 'fixed',
          zIndex: theme.zIndex.fab,
          bottom: '1em',
          left: '0',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        <Stack
          direction='column'
          spacing={2}
          sx={{
            alignItems: 'center',
            width: 'calc(100% - 32px)',
            maxWidth: '500px',
            ml: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* 控制条 */}
          <Fade in={controlsVisible}>
            <Stack
              direction='row'
              spacing={1}
              ref={controlsRef}
              sx={{
                borderRadius: 1,
                backgroundColor: alpha(common.white, 0.5),
                backdropFilter: 'blur(8px)',
                boxShadow: theme.shadows[10],
                pointerEvents: 'auto',
              }}
            >
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
          </Fade>
          {/* 标题 / 歌词 */}
          <Typography
            ref={textRef}
            // noWrap
            variant='h3'
            sx={{
              pointerEvents: 'auto',
              maxWidth: '100%',
              fontWeight: 'bold',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {text}
          </Typography>
        </Stack>
      </Box>
    </SlideUpTransition>
  )
}
