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
    }
  })

  const lyricsSx: SxProps<Theme> = {
    pointerEvents: 'auto',
    position: 'relative',
    padding: '4px',
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
          <Box
            component='rect'
            width='100%'
            stroke='none'
            fill={red[100]}
            y='100%'
            height={{
              xs: 2,
              md: 1,
            }}
            sx={{
              transform: {
                xs: 'translateY(-2px)',
                md: 'translateY(-1px)',
              },
            }}
          />
          <Box
            component='rect'
            stroke='none'
            fill={red[500]}
            y='100%'
            height={{
              xs: 2,
              md: 1,
            }}
            sx={{
              transform: {
                xs: 'translateY(-2px)',
                md: 'translateY(-1px)',
              },
            }}
            // 这儿动态的样式用 style，避免 dev 模式下 mui 不断往 header 创建 style
            style={{
              width: `${
                ((state.time ?? 0) / Math.max(state.duration ?? 1, 1)) * 100
              }%`,
            }}
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
          bottom: '0',
          left: '0',
          // 这儿必须用 vw, 不能用 %, 因为当 menu/popover 弹出时, 单位为百分比时元素会抖动
          width: '100vw',
          pointerEvents: 'none',
        }}
      >
        <ClickAwayListener onClickAway={() => setControlsVisible(false)}>
          <Stack
            direction='column'
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
            <Box sx={{ maxWidth: '100%', py: 1, pointerEvents: 'auto' }}>
              <ButtonBase
                autoFocus
                onClick={() => setControlsVisible((prev) => !prev)}
                sx={lyricsSx}
              >
                {activeLyricsItem.text}
                {progressBar}
              </ButtonBase>
            </Box>
          </Stack>
        </ClickAwayListener>
      </Box>
    </SlideUpTransition>
  )
}
