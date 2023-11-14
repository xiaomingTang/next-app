'use client'

import styles from './MusicTriggerButton.module.scss'

import { useMediaLoading } from '@/hooks/useMediaLoading'

import { IconButton } from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import { useAudio } from 'react-use'
import clsx from 'clsx'
import { useEffect } from 'react'

export function MusicTriggerButton() {
  const [audio, state, controls, ref] = useAudio({
    src: 'https://next-app-storage-04a4aa9a124907-staging.s3.ap-northeast-2.amazonaws.com/public/2023-11-14/qgubmQojbIFy.mp3',
  })
  const { loading, setMedia } = useMediaLoading()

  useEffect(() => {
    setMedia(ref.current)
  }, [setMedia, ref])

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
      {audio}
    </IconButton>
  )
}
