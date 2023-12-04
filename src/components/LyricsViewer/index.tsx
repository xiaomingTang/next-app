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
import { common, red } from '@mui/material/colors'

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
            <Fade in={controlsVisible} unmountOnExit>
              <Stack
                direction='row'
                spacing={1}
                sx={{
                  borderRadius: 1,
                  pointerEvents: 'auto',

                  backdropFilter: 'blur(4px)',
                  color: red[700],
                  backgroundColor: alpha(common.white, 0.7),
                  [dark()]: {
                    color: red[700],
                    backgroundColor: alpha(common.black, 0.7),
                  },
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
                fontSize: '20px',
                borderRadius: 1,
                cursor: 'pointer',

                backdropFilter: 'blur(4px)',
                color: red[700],
                backgroundColor: alpha(common.white, 0.7),
                [dark()]: {
                  color: red[700],
                  backgroundColor: alpha(common.black, 0.7),
                },

                ':focus': obj(
                  controlsVisible && {
                    outline: `1px solid ${red[700]}`,
                  }
                ),
                ':focus-visible': {
                  outline: `1px solid ${red[700]}`,
                },
              }}
            >
              {activeLyricsItem.text}
            </ButtonBase>
          </Stack>
        </ClickAwayListener>
      </Box>
    </SlideUpTransition>
  )
}
