'use client'

import { resizeTo } from '@/utils/resizeTo'
import { useMediaPlaying } from '@/hooks/useMediaPlaying'
import { useListen } from '@/hooks/useListen'

import { startTransition, useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import { useWindowSize } from 'react-use'

export interface StreamVideoContext {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

interface Props {
  mirror?: boolean
  controls?: boolean
  muted?: boolean
  mediaStream?: MediaStream | null
  fit?: 'cover' | 'contain'
  onTick?: (e: StreamVideoContext) => void
  stopTrackOnUnmount?: boolean
}

export function StreamVideo({
  mirror,
  fit = 'cover',
  mediaStream,
  onTick,
  controls = false,
  muted = true,
  stopTrackOnUnmount = false,
}: Props) {
  let rafFlag = -1
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const windowSize = useWindowSize()
  const { playing, setMedia } = useMediaPlaying()

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mediaStream) {
      return
    }
    video.srcObject = mediaStream
    setMedia(video)
    void video.play()

    return () => {
      if (stopTrackOnUnmount) {
        mediaStream?.getTracks().forEach((track) => track.stop())
        video.srcObject = null
      }
    }
  }, [mediaStream, setMedia, stopTrackOnUnmount])

  useListen(`${[playing, windowSize.width, windowSize.height]}`, () => {
    window.cancelAnimationFrame(rafFlag)
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (
      !video ||
      !canvas ||
      !ctx ||
      video.readyState !== video.HAVE_ENOUGH_DATA
    ) {
      return
    }
    const videoSize = {
      width: video.videoWidth,
      height: video.videoHeight,
    }
    const canvasSize = resizeTo({
      src: {
        width: Math.floor(canvas.clientWidth),
        height: Math.floor(canvas.clientHeight),
      },
      target: videoSize,
      fit: fit === 'contain' ? 'cover' : 'contain',
    })
    canvasSize.width = Math.floor(canvasSize.width)
    canvasSize.height = Math.floor(canvasSize.height)
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    const updateCanvas =
      fit === 'cover'
        ? () => {
            ctx.drawImage(
              video,
              (videoSize.width - canvasSize.width) / 2,
              (videoSize.height - canvasSize.height) / 2,
              canvasSize.width,
              canvasSize.height,
              0,
              0,
              canvasSize.width,
              canvasSize.height
            )
          }
        : () => {
            ctx.drawImage(
              video,
              0,
              0,
              videoSize.width,
              videoSize.height,
              (canvasSize.width - videoSize.width) / 2,
              (canvasSize.height - videoSize.height) / 2,
              videoSize.width,
              videoSize.height
            )
          }

    const tick = () => {
      startTransition(updateCanvas)
      startTransition(() => {
        onTick?.({
          canvas,
          ctx,
        })
      })
      rafFlag = window.requestAnimationFrame(tick)
    }
    rafFlag = window.requestAnimationFrame(tick)
  })

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform: mirror ? 'rotateY(180deg)' : undefined,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
      <video
        ref={videoRef}
        controls={controls}
        muted={muted}
        playsInline
        webkit-playsinline='true'
        x-webkit-airplay='true'
        x5-video-player-type='h5'
        x5-video-player-fullscreen='true'
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  )
}
