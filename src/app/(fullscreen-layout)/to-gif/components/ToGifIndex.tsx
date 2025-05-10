'use client'

import { LoadFFmpeg } from './LoadFFmpeg'
import { LoadImages } from './LoadImages'
import { ImagesPreview, useImages } from './ImagesPreview'

import { useState } from 'react'
import { Box } from '@mui/material'

function ToGifBody() {
  const [exited1, setExited1] = useState(false)
  const [exited2, setExited2] = useState(false)
  const { images } = useImages()

  return (
    <>
      <LoadFFmpeg exited={exited1} onExited={setExited1} />
      <LoadImages
        exited={!exited1 || (exited2 && images.length > 0)}
        onExited={setExited2}
      />
      {exited1 && exited2 && <ImagesPreview />}
    </>
  )
}

export function ToGifIndex() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <ToGifBody />
    </Box>
  )
}
