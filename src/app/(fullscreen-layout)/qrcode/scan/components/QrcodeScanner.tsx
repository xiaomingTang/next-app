'use client'

import { QrcodeDisplayItem } from './QrcodeDisplayItem'
import { useQrcodeHandler } from './QrcodeHandlers'

import { toPlainError } from '@/errors/utils'
import { getUserMedia } from '@/utils/media'
import { StreamVideo } from '@/app/(default-layout)/blog/components/StreamVideo'

import useSWR from 'swr'
import { useState } from 'react'
import jsQR from 'jsqr'
import { toast } from 'react-hot-toast'
import { Box } from '@mui/material'
import { throttle } from 'lodash-es'

import type { StreamVideoContext } from '@/app/(default-layout)/blog/components/StreamVideo'
import type { QRCode } from 'jsqr'

export function QrcodeScanner({
  fit = 'cover',
}: {
  fit?: 'cover' | 'contain'
}) {
  let readerTimeoutFlag = -1
  const { data: mediaStream = null } = useSWR('getUserVideo', () =>
    getUserMedia().catch((err) => {
      toast.error(toPlainError(err).message)
    })
  )
  const [QRContent, setQRContent] = useState<QRCode | null>(null)
  const [savedCanvasSize, setSavedCanvasSize] = useState({
    width: 1,
    height: 1,
  })

  useQrcodeHandler(QRContent?.data)

  const onTick = throttle(({ ctx, canvas }: StreamVideoContext) => {
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
      window.clearTimeout(readerTimeoutFlag)
      readerTimeoutFlag = window.setTimeout(() => {
        setQRContent(null)
      }, 2500)
    }
  }, 500)

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <StreamVideo fit={fit} mediaStream={mediaStream} onTick={onTick} />
      {QRContent && (
        <QrcodeDisplayItem qrcode={QRContent} canvasSize={savedCanvasSize} />
      )}
    </Box>
  )
}
