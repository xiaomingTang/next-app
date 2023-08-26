'use client'

import { QRCodeDisplayItem } from './QRCodeDisplayItem'

import { toPlainError } from '@/errors/utils'
import { getUserVideo } from '@/utils/media/video'
import { resizeTo } from '@/utils/resizeTo'
import { useMediaPlaying } from '@/hooks/useMediaPlaying'
import { useListen } from '@/hooks/useListen'

import useSWR from 'swr'
import { startTransition, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { toast } from 'react-hot-toast'
import { Box } from '@mui/material'
import { noop, throttle } from 'lodash-es'
import { useWindowSize } from 'react-use'

import type { QRCode } from 'jsqr'

export function QrCodeScanner({
  fit = 'cover',
}: {
  fit?: 'cover' | 'contain'
}) {
  let rafFlag = -1
  let readerTimeoutFlag = -1
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { data: mediaStream } = useSWR('getUserVideo', () =>
    getUserVideo().catch((err) => {
      toast.error(toPlainError(err).message)
    })
  )
  const windowSize = useWindowSize()
  const [QRContent, setQRContent] = useState<QRCode | null>(null)
  const { playing, setMedia } = useMediaPlaying()
  const [savedCanvasSize, setSavedCanvasSize] = useState({
    width: 1,
    height: 1,
  })

  useEffect(() => {
    const video = videoRef.current
    if (!video || !mediaStream) {
      return noop
    }
    setMedia(video)
    video.srcObject = mediaStream

    video.play()

    return () => {
      video.pause()
    }
  }, [mediaStream, setMedia])

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

    setSavedCanvasSize(canvasSize)

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

    const readQRCode = throttle(() => {
      const imageData = ctx.getImageData(
        0,
        0,
        canvasSize.width,
        canvasSize.height
      )
      const content = jsQR(
        imageData.data,
        canvasSize.width,
        canvasSize.height,
        {
          inversionAttempts: 'attemptBoth',
        }
      )
      if (content) {
        setQRContent(content)
        // 重置 timer
        window.clearTimeout(readerTimeoutFlag)
        readerTimeoutFlag = window.setTimeout(() => {
          setQRContent(null)
        }, 2500)
      }
    }, 500)

    const tick = () => {
      startTransition(updateCanvas)
      startTransition(readQRCode)
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
        controls={false}
        muted
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
      {QRContent && (
        <QRCodeDisplayItem qrcode={QRContent} canvasSize={savedCanvasSize} />
      )}
    </Box>
  )
}
