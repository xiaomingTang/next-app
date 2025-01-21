import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { Box } from '@mui/material'
import { useMemo } from 'react'

export function AudioControls({ file }: { file: File }) {
  const src = useMemo(() => URL.createObjectURL(file), [file])
  // const audio

  return <Box></Box>
}
