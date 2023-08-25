// https://www.bookstack.cn/read/javascript-tutorial/docs-elements-video.md#770on7
import { useEventCallback } from '@mui/material'
import { useState } from 'react'
import { useEvent } from 'react-use'

export function useMediaPlaying() {
  const [media, setMedia] = useState<HTMLMediaElement | null>()
  const [playing, setPlaying] = useState(false)

  const onPlaying = useEventCallback(() => {
    setPlaying(true)
  })
  useEvent('playing', onPlaying, media)

  const onEnd = useEventCallback(() => {
    setPlaying(false)
  })
  useEvent('ended', onEnd, media)

  const onPause = useEventCallback(() => {
    setPlaying(false)
  })
  useEvent('pause', onPause, media)

  return { playing, setMedia }
}
