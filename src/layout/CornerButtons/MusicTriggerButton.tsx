import styles from './MusicTriggerButton.module.css'

import { useGlobalAudio } from '@/components/useGlobalAudio'
import { useLyricsViewer } from '@/components/LyricsViewer/context'

import { IconButton } from '@mui/material'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import clsx from 'clsx'

export function MusicTriggerButton() {
  const { state, mp3s, loading, activeMP3, controls } = useGlobalAudio()
  const { visible: lyricsViewerVisible } = useLyricsViewer()

  return (
    <IconButton
      aria-label='音乐开关'
      disabled={mp3s.length === 0}
      onClick={() => {
        if (!activeMP3) {
          controls.switchToIndex(0)
        }
        if (!lyricsViewerVisible) {
          void controls.play()
        }
        useLyricsViewer.toggleVisible()
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
          mp3s.length > 0 && (state.paused ? styles.shake : styles.rotate),
          loading && styles.blink
        )}
      />
    </IconButton>
  )
}
