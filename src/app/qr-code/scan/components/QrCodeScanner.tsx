'use client'

import { toPlainError } from '@/errors/utils'
import { getUserVideo } from '@/utils/media/video'
import { resizeTo } from '@/utils/resizeTo'

import useSWR from 'swr'
import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { toast } from 'react-hot-toast'
import { Box } from '@mui/material'
import { noop } from 'lodash-es'
import { useWindowSize } from 'react-use'

import type { QRCode } from 'jsqr'

// TODO: 抖动

export function QrCodeScanner({
  fit = 'cover',
}: {
  fit?: 'cover' | 'contain'
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { data: mediaStream } = useSWR('getUserVideo', () =>
    getUserVideo().catch((err) => {
      toast.error(toPlainError(err).message)
    })
  )
  const windowSize = useWindowSize()
  const [QRContent, setQRContent] = useState<QRCode | null>(null)
  const [savedCanvasSize, setSavedCanvasSize] = useState({
    width: 1,
    height: 1,
  })

  useEffect(() => {
    let rafIndex = -1
    const video = videoRef.current
    if (!video || !mediaStream) {
      return noop
    }
    video.srcObject = mediaStream

    video.play().then(() => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        return
      }
      const videoSize = {
        width: video.videoWidth,
        height: video.videoHeight,
      }
      const canvasClientSize = {
        width: Math.floor(canvas.clientWidth),
        height: Math.floor(canvas.clientHeight),
      }
      const canvasSize = resizeTo({
        src: canvasClientSize,
        target: videoSize,
        fit: fit === 'contain' ? 'cover' : 'contain',
      })
      canvasSize.width = Math.floor(canvasSize.width)
      canvasSize.height = Math.floor(canvasSize.height)
      setSavedCanvasSize(canvasSize)
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
        updateCanvas()
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
        setQRContent(content)
        rafIndex = window.requestAnimationFrame(tick)
      }
      rafIndex = window.requestAnimationFrame(tick)
    })

    return () => {
      video.pause()
      window.cancelAnimationFrame(rafIndex)
    }
  }, [fit, mediaStream, windowSize.width, windowSize.height])

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
        <Box
          sx={{
            position: 'absolute',
            left: `${
              ((QRContent.location.topLeftCorner.x +
                QRContent.location.bottomRightCorner.x) /
                2 /
                savedCanvasSize.width) *
              100
            }%`,
            top: `${
              ((QRContent.location.topLeftCorner.y +
                QRContent.location.bottomRightCorner.y) /
                2 /
                savedCanvasSize.height) *
              100
            }%`,
            transform: 'translate(-50%,-50%)',
            padding: '1em',
            backgroundColor: 'rgba(255,255,255,.1)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {QRContent.data}
        </Box>
      )}
    </Box>
  )
}
