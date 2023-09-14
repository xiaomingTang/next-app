'use client'

import { colorToCss, getComplementaryColor, toColor } from '../utils/color'
import { drawWallpaper } from '../utils/canvas'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { useFullScreen } from '@/utils/device'

import { Box, IconButton, Link, Stack, TextField } from '@mui/material'
import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import DownloadIcon from '@mui/icons-material/Download'
import PaletteIcon from '@mui/icons-material/Palette'
import { useEvent } from 'react-use'
import { clamp, debounce } from 'lodash-es'

import type { Color } from '../utils/color'

export function WallpaperRoot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [inputWidth, setInputWidth] = useState(1920)
  const [inputHeight, setInputHeight] = useState(1080)
  const [canvasUrl, setCanvasUrl] = useState('')
  const { isFullScreen, fullScreenEnabled, toggleFullScreen } = useFullScreen()
  const searchParams = useSearchParams()
  const [lt, setLt] = useState(searchParams.get('lt') || '')
  const [rt, setRt] = useState(searchParams.get('rt') || '')
  const [lb, setLb] = useState(searchParams.get('lb') || '')
  const [rb, setRb] = useState(searchParams.get('rb') || '')
  const clt = useMemo(() => toColor(`#${lt}`, toColor('#408390')), [lt])
  const crt = useMemo(() => toColor(`#${rt}`, toColor('#D62E2D')), [rt])
  const clb = useMemo(() => toColor(`#${lb}`, toColor('#B5A933')), [lb])
  const crb = useMemo(() => toColor(`#${rb}`, toColor('#0582E8')), [rb])
  const centerTextColor = colorToCss(
    getComplementaryColor([
      (clt[0] + crt[0] + clb[0] + crb[0]) / 4,
      (clt[1] + crt[1] + clb[1] + crb[1]) / 4,
      (clt[2] + crt[2] + clb[2] + crb[2]) / 4,
      (clt[3] + crt[3] + clb[3] + crb[3]) / 4,
    ]),
    'hex'
  )
  console.log(centerTextColor)
  /**
   * 更新用户可见的 canvas
   */
  const updateCanvas = useMemo(
    () =>
      debounce(() => {
        startTransition(() => {
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (!canvas || !ctx) {
            return
          }
          const width = canvas.clientWidth * window.devicePixelRatio
          const height = canvas.clientHeight * window.devicePixelRatio
          canvas.width = width
          canvas.height = height
          const imageData = new ImageData(width, height)
          drawWallpaper(imageData, clt, crt, clb, crb)
          ctx.putImageData(imageData, 0, 0)
        })
      }, 500),
    [clb, clt, crb, crt]
  )

  /**
   * 更新用户不可见的 canvas (用于生成下载链接)
   */
  const updateHiddenCanvas = useMemo(
    () =>
      debounce(() => {
        startTransition(() => {
          const hiddenCanvas = document.createElement('canvas')
          const hiddenCtx = hiddenCanvas.getContext('2d')
          if (!hiddenCtx) {
            return
          }
          hiddenCanvas.width = inputWidth
          hiddenCanvas.height = inputHeight
          const imageData = new ImageData(inputWidth, inputHeight)
          drawWallpaper(imageData, clt, crt, clb, crb)
          hiddenCtx.putImageData(imageData, 0, 0)
          hiddenCanvas.toBlob((blob) => {
            if (blob) {
              setCanvasUrl(URL.createObjectURL(blob))
            }
          })
        })
      }, 500),
    [clb, clt, crb, crt, inputHeight, inputWidth]
  )

  useEffect(() => {
    updateCanvas()
  }, [updateCanvas])

  useEffect(() => {
    setCanvasUrl('')
    updateHiddenCanvas()
  }, [updateHiddenCanvas])

  useEvent('resize', updateCanvas)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <DefaultHeaderShim />
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
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
        {/* 操作按钮 */}
        <Stack
          direction='row'
          flexWrap='wrap'
          useFlexGap
          spacing={1}
          sx={{
            position: 'absolute',
            width: '90%',
            maxWidth: '600px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            alignItems: 'center',
            justifyContent: {
              xs: 'flex-start',
              sm: 'center',
            },
            color: centerTextColor,
          }}
        >
          <TextField
            type='number'
            label='宽度 W'
            size='small'
            value={inputWidth}
            sx={{
              width: '6em',
              '& label': {
                color: centerTextColor,
              },
              '& .MuiOutlinedInput-root': {
                color: centerTextColor,
                '& fieldset': {
                  borderColor: centerTextColor,
                },
              },
            }}
            onChange={(e) => {
              setInputWidth(clamp(parseInt(e.target.value || '1', 10), 1, 8000))
            }}
          />
          <TextField
            type='number'
            label='高度 H'
            size='small'
            value={inputHeight}
            sx={{
              width: '6em',
              '& label': {
                color: centerTextColor,
              },
              '& .MuiOutlinedInput-root': {
                color: centerTextColor,
                '& fieldset': {
                  borderColor: centerTextColor,
                },
              },
            }}
            onChange={(e) => {
              setInputHeight(
                clamp(parseInt(e.target.value || '1', 10), 1, 8000)
              )
            }}
          />
          <IconButton
            disabled={!canvasUrl}
            LinkComponent={Link}
            href={canvasUrl || '/'}
            download='wallpaper.png'
            target='_blank'
          >
            <DownloadIcon sx={{ fontSize: '2em' }} />
          </IconButton>
          <IconButton
            disabled={!fullScreenEnabled}
            onClick={() => {
              const container = containerRef.current
              if (!container) {
                return
              }
              toggleFullScreen(container)
            }}
          >
            {isFullScreen ? (
              <FullscreenExitIcon sx={{ fontSize: '2em' }} />
            ) : (
              <FullscreenIcon sx={{ fontSize: '2em' }} />
            )}
          </IconButton>
        </Stack>
        {/* 选择颜色 */}
        <>
          <IconButton
            sx={{
              position: 'absolute',
              left: '0.5em',
              top: '0.5em',
              color: colorToCss(getComplementaryColor(clt), 'hex'),
            }}
          >
            <PaletteIcon />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              right: '0.5em',
              top: '0.5em',
              color: colorToCss(getComplementaryColor(crt), 'hex'),
            }}
          >
            <PaletteIcon />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              left: '0.5em',
              bottom: '0.5em',
              color: colorToCss(getComplementaryColor(clb), 'hex'),
            }}
          >
            <PaletteIcon />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              right: '0.5em',
              bottom: '0.5em',
              color: colorToCss(getComplementaryColor(crb), 'hex'),
            }}
          >
            <PaletteIcon />
          </IconButton>
        </>
      </Box>
    </Box>
  )
}
