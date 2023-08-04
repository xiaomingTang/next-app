import { useEventCallback } from '@mui/material'
import { useState } from 'react'
import { useEvent } from 'react-use'

export function useMediaLoading() {
  const [media, setMedia] = useState<HTMLMediaElement | null>()
  const [loading, setLoading] = useState(false)

  const onLoadedMetadata = useEventCallback(() => {
    setLoading(false)
  })
  useEvent('loadedmetadata', onLoadedMetadata, media)

  const onLoadedData = useEventCallback(() => {
    setLoading(false)
  })
  useEvent('loadeddata', onLoadedData, media)

  const onPlay = useEventCallback(() => {
    setLoading(true)
  })
  useEvent('play', onPlay, media)

  const onWaiting = useEventCallback(() => {
    setLoading(true)
  })
  useEvent('waiting', onWaiting, media)

  const onPlaying = useEventCallback(() => {
    setLoading(false)
  })
  useEvent('playing', onPlaying, media)

  const onEnd = useEventCallback(() => {
    setLoading(false)
  })
  useEvent('ended', onEnd, media)

  const onPause = useEventCallback(() => {
    setLoading(false)
  })
  useEvent('pause', onPause, media)

  return { loading, setMedia }
}
