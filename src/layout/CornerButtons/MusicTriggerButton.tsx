'use client'

import styles from './MusicTriggerButton.module.scss'

import { useAudio } from '@/components/GlobalAudioPlayer'

import { IconButton } from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import clsx from 'clsx'

export function MusicTriggerButton() {
  const { state, controls, loading } = useAudio()

  return (
    <IconButton
      aria-label='音乐开关'
      onClick={() => {
        if (state.paused) {
          controls.play()
        } else {
          controls.pause()
        }
      }}
    >
      <svg width={0} height={0}>
        <linearGradient id='musicIconLinearColors' x1={1} y1={0} x2={1} y2={1}>
          <stop offset={0} stopColor='rgba(0, 0, 0, 0.87)' />
          <stop offset={1} stopColor='#FB0027' />
        </linearGradient>
      </svg>
      <MusicNoteIcon
        sx={{ fill: 'url(#musicIconLinearColors)' }}
        className={clsx(
          state.paused ? styles.shake : styles.rotate,
          loading && styles.blink
        )}
      />
    </IconButton>
  )
}
