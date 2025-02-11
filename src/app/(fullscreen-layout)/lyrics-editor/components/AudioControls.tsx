import {
  LyricsEditorAudioPlayer,
  useLyricsEditor,
  useLyricsEditorAudio,
} from './store'

import { cat } from '@/errors/catchAndToast'
import { isButton, isInputting, useKeyDown, useKeyPress } from '@/hooks/useKey'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box, Button, ButtonGroup, IconButton } from '@mui/material'

export function AudioControls() {
  const paused = useLyricsEditorAudio((s) => s.state.paused)
  const controls = useLyricsEditorAudio((s) => s.controls)
  const loading = useLyricsEditorAudio((s) => s.loading)
  const audioUrl = useLyricsEditor((s) => s.audioUrl)
  const disabled = loading || !audioUrl

  useKeyPress((e) => {
    if (e.key === ' ' && !isButton(e) && !isInputting(e)) {
      e.preventDefault()
      e.stopPropagation()
      void controls.togglePlay()
    }
  })

  useKeyDown((e) => {
    if (e.key === 'ArrowLeft' && !isButton(e) && !isInputting(e)) {
      void controls.seekBackward(3)
    }
    if (e.key === 'ArrowRight' && !isButton(e) && !isInputting(e)) {
      void controls.seekForward(3)
    }
  })

  return (
    <Box sx={{ py: 1 }}>
      <ButtonGroup variant='outlined' disabled={disabled} size='medium'>
        <Button onClick={() => controls.seekBackward(10)}>-10s</Button>
        <Button onClick={() => controls.seekBackward(5)}>-5s</Button>
        <Button onClick={() => controls.seekBackward(3)}>-3s</Button>
        <Button onClick={() => controls.seekBackward(1)}>-1s</Button>
      </ButtonGroup>
      <IconButton
        disabled={disabled}
        loading={loading}
        onClick={cat(() => controls.togglePlay())}
        color='primary'
        sx={{ mx: 2 }}
      >
        {paused ? <PlayArrowIcon /> : <PauseIcon />}
      </IconButton>
      <ButtonGroup variant='outlined' disabled={disabled} size='medium'>
        <Button onClick={() => controls.seekForward(1)}>+1s</Button>
        <Button onClick={() => controls.seekForward(3)}>+3s</Button>
        <Button onClick={() => controls.seekForward(5)}>+5s</Button>
        <Button onClick={() => controls.seekForward(10)}>+10s</Button>
      </ButtonGroup>
      <LyricsEditorAudioPlayer />
    </Box>
  )
}
