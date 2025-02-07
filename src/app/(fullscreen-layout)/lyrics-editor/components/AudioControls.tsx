import {
  LyricsEditorAudioPlayer,
  useLyricsEditor,
  useLyricsEditorAudio,
} from './store'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box, Button, ButtonGroup, IconButton } from '@mui/material'

export function AudioControls() {
  const paused = useLyricsEditorAudio((s) => s.state.paused)
  const controls = useLyricsEditorAudio((s) => s.controls)
  const loading = useLyricsEditorAudio((s) => s.loading)
  const audioUrl = useLyricsEditor((s) => s.audioUrl)
  const disabled = loading || !audioUrl

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
        onClick={() => controls.togglePlay()}
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
