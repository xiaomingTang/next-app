'use client'

import { useLyricsViewer } from './context'
import { useHasShown, useLyrics } from './utils'

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
  IconButton,
  Stack,
  alpha,
  useTheme,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { useState } from 'react'
import { blue, common } from '@mui/material/colors'
import { clamp } from 'lodash-es'

function calculateTextSize(text: string) {
  let size = 0

  for (let i = 0; i < text.length; i += 1) {
    // 使用正则表达式判断字符是否为中文
    const isChinese = /[\u4e00-\u9fa5]/.test(text[i])

    // 根据中文和非中文的情况累加大小
    size += isChinese ? 1 : 0.5
  }

  return size
}

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

  if (globalThis.mp3s.length === 0) {
    return <></>
  }

  return (
    <SlideUpTransition in={visible} unmountOnExit>
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
        <ClickAwayListener onClickAway={() => setControlsVisible(false)}>
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
            <Fade in={controlsVisible} unmountOnExit>
              <Stack
                direction='row'
                spacing={1}
                sx={{
                  borderRadius: 1,
                  backgroundColor: alpha(common.white, 0.5),
                  [dark()]: {
                    backgroundColor: alpha(common.black, 0.5),
                  },
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
            <ButtonBase
              autoFocus
              onClick={() => setControlsVisible((prev) => !prev)}
              sx={{
                pointerEvents: 'auto',
                position: 'relative',
                padding: '4px',
                maxWidth: '100%',
                fontWeight: 'bold',
                textAlign: 'center',
                letterSpacing: '1px',
                cursor: 'pointer',
                color: 'transparent',
                borderRadius: '4px',
                backgroundColor: alpha(common.white, 0.1),
                backdropFilter: 'blur(4px)',

                textShadow: '0 0 4px gray',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'clip',

                fontSize: {
                  xs: `${
                    20 -
                    clamp(calculateTextSize(activeLyricsItem.text) - 15, 0, 10)
                  }px`,
                  sm: '20px',
                },
                ':focus': obj(
                  controlsVisible && {
                    outline: `1px solid ${blue[700]}`,
                  }
                ),
                ':focus-visible': {
                  outline: `1px solid ${blue[700]}`,
                },
              }}
            >
              {activeLyricsItem.text}
              <SvgText text={activeLyricsItem.text} />
            </ButtonBase>
          </Stack>
        </ClickAwayListener>
      </Box>
    </SlideUpTransition>
  )
}
