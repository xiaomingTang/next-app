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
import { useRef, useState } from 'react'
import { common } from '@mui/material/colors'

const defaultSize = { width: 0, height: 0 }

function SvgText({ text }: { text: string }) {
  const [size, setSize] = useState(defaultSize)
  return (
    <svg
      ref={(ref) => {
        const rect = ref?.parentElement?.getBoundingClientRect()
        if (rect) {
          if (rect.width !== size.width || rect.height !== size.height) {
            setSize({
              width: rect.width,
              height: rect.height,
            })
          }
        }
      }}
      width={size.width}
      height={size.height}
      strokeWidth='1'
      strokeLinejoin='round'
      strokeLinecap='round'
      xmlns='http://www.w3.org/2000/svg'
      style={{
        position: 'absolute',
        top: '0',
        left: '0',
        padding: '4px',
        pointerEvents: 'none',
      }}
    >
      <g fill='#cccccc' stroke='#F2595C'>
        <text
          className='svg-text'
          x='50%'
          y='50%'
          textAnchor='middle'
          alignmentBaseline='middle'
        >
          {text}
        </text>
      </g>
    </svg>
  )
}

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

  const { activeLyricsItem } = useLyrics({
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
          bottom: '0.5em',
          left: '0',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        <Stack
          direction='column'
          spacing={1}
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
            noWrap
            variant='h3'
            sx={{
              pointerEvents: 'auto',
              position: 'relative',
              padding: '4px',
              maxWidth: '100%',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: '20px',
              letterSpacing: '1px',
              cursor: 'pointer',
              userSelect: 'none',
              color: 'transparent',
              borderRadius: '4px',
              backgroundColor: alpha(common.white, 0.2),
              backdropFilter: 'blur(4px)',
            }}
          >
            {activeLyricsItem.text}
            <SvgText text={activeLyricsItem.text} />
          </Typography>
        </Stack>
      </Box>
    </SlideUpTransition>
  )
}
