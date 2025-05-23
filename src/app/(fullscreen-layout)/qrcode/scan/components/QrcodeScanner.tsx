'use client'

import { QrcodeDisplayItem } from './QrcodeDisplayItem'
import { useQrcodeHandler } from './QrcodeHandlers'

import { useUserMedia } from '@/utils/media'
import { StreamVideo } from '@D/blog/components/StreamVideo'

import useSWR from 'swr'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Box, CircularProgress } from '@mui/material'
import { throttle } from 'lodash-es'

import type { StreamVideoContext } from '@D/blog/components/StreamVideo'
import type { QRCode } from 'jsqr'

export function QrcodeScanner({
  fit = 'cover',
}: {
  fit?: 'cover' | 'contain'
}) {
  const readerTimeoutFlagRef = useRef(-1)
  const { stream: mediaStream, error: mediaError } = useUserMedia()

  useEffect(() => {
    if (mediaError) {
      toast.error(mediaError.message)
    }
  }, [mediaError])

  const [QRContent, setQRContent] = useState<QRCode | null>(null)
  const [savedCanvasSize, setSavedCanvasSize] = useState({
    width: 1,
    height: 1,
  })

  useQrcodeHandler(QRContent?.data)

  const { data: jsQR, isValidating } = useSWR('jsqr', () =>
    import('jsqr')
      .then((mod) => mod.default)
      .catch(() => {
        toast.error('组件加载错误，请刷新页面以重试')
        return null
      })
  )

  const onTick = useMemo(() => {
    if (!jsQR) {
      return () => undefined
    }
    return throttle(({ ctx, canvas }: StreamVideoContext) => {
      setSavedCanvasSize({
        width: canvas.width,
        height: canvas.height,
      })
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const content = jsQR(imageData.data, canvas.width, canvas.height, {
        inversionAttempts: 'attemptBoth',
      })
      if (content) {
        setQRContent(content)
        // 重置 timer
        window.clearTimeout(readerTimeoutFlagRef.current)
        readerTimeoutFlagRef.current = window.setTimeout(() => {
          setQRContent(null)
        }, 2500)
      }
    }, 500)
  }, [jsQR])

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <StreamVideo
        fit={fit}
        mediaStream={mediaStream}
        onTick={onTick}
        stopTrackOnUnmount
      />
      {QRContent && (
        <QrcodeDisplayItem qrcode={QRContent} canvasSize={savedCanvasSize} />
      )}
      {isValidating && (
        <CircularProgress
          size='24px'
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </Box>
  )
}
