/* eslint-disable @typescript-eslint/naming-convention */

'use client'

import { ColorPicker } from './elems'

import { colorToCss, getComplementaryColor, toColor } from '../utils/color'
import { drawWallpaper } from '../utils/canvas'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { useFullScreen } from '@/utils/device'
import { obj } from '@/utils/tiny'
import { Link } from '@/components/CustomLink'

import { Box, IconButton, Stack, TextField } from '@mui/material'
import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import DownloadIcon from '@mui/icons-material/Download'
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor'
import LoopIcon from '@mui/icons-material/Loop'
import { useEvent } from 'react-use'
import { clamp, debounce, shuffle } from 'lodash-es'
import randomColor from 'randomcolor'

import type { SxProps, Theme } from '@mui/material'

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

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('lt', colorToCss(clt, 'hex').slice(1))
    url.searchParams.set('rt', colorToCss(crt, 'hex').slice(1))
    url.searchParams.set('lb', colorToCss(clb, 'hex').slice(1))
    url.searchParams.set('rb', colorToCss(crb, 'hex').slice(1))
    window.history.replaceState(null, '', url)
  }, [clb, clt, crb, crt])

  useEvent('resize', updateCanvas)

  const weakWhenFullScreenProps: SxProps<Theme> = {
    transition: 'opacity 1s',
    ...obj(
      isFullScreen && {
        opacity: 0.1,
        '&:hover': {
          opacity: 1,
        },
      }
    ),
  }

  const hideWhenFullScreenProps: SxProps<Theme> = {
    transition: 'opacity 1s',
    ...obj(
      isFullScreen && {
        opacity: 0,
        pointerEvents: 'none',
      }
    ),
  }

  const inputProps: SxProps<Theme> = {
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
    ...hideWhenFullScreenProps,
  }

  const colorPickerProps: SxProps<Theme> = {
    position: 'absolute',
    p: 1,
    borderRadius: '999px',
    transition: 'opacity 1s',
    ...weakWhenFullScreenProps,
  }

  const setRandomColors = () => {
    const colorList = shuffle([
      'red',
      'orange',
      'yellow',
      'green',
      'blue',
      'purple',
      'pink',
      'monochrome',
    ])
    setLt(
      randomColor({
        hue: colorList[0],
        format: 'hex',
      }).slice(1)
    )
    setRt(
      randomColor({
        hue: colorList[1],
        format: 'hex',
      }).slice(1)
    )
    setLb(
      randomColor({
        hue: colorList[2],
        format: 'hex',
      }).slice(1)
    )
    setRb(
      randomColor({
        hue: colorList[3],
        format: 'hex',
      }).slice(1)
    )
  }

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
        {/* 操作区域 */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            color: centerTextColor,
          }}
        >
          <Stack direction='row' spacing={1} alignItems='center'>
            <TextField
              type='number'
              label='宽度 W'
              value={inputWidth}
              sx={inputProps}
              onChange={(e) => {
                setInputWidth(
                  clamp(parseInt(e.target.value || '1', 10), 1, 8000)
                )
              }}
            />
            <TextField
              type='number'
              label='高度 H'
              value={inputHeight}
              sx={inputProps}
              onChange={(e) => {
                setInputHeight(
                  clamp(parseInt(e.target.value || '1', 10), 1, 8000)
                )
              }}
            />
            <IconButton
              aria-label='设置为设备尺寸'
              title='设置为设备尺寸'
              sx={hideWhenFullScreenProps}
              onClick={() => {
                setInputWidth(window.screen.width)
                setInputHeight(window.screen.height)
              }}
            >
              <ScreenshotMonitorIcon sx={{ fontSize: '2em' }} />
            </IconButton>
          </Stack>
          <Stack direction='row' spacing={1} alignItems='center'>
            <IconButton
              aria-label='下载'
              title='下载'
              disabled={!canvasUrl}
              LinkComponent={Link}
              href={canvasUrl || '/'}
              download='wallpaper.png'
              target='_blank'
              sx={hideWhenFullScreenProps}
            >
              <DownloadIcon sx={{ fontSize: '2em' }} />
            </IconButton>
            <IconButton
              aria-label='随机颜色'
              title='随机颜色'
              onClick={setRandomColors}
              sx={weakWhenFullScreenProps}
            >
              <LoopIcon sx={{ fontSize: '2em' }} />
            </IconButton>
            <IconButton
              aria-label='切换全屏'
              title='切换全屏'
              disabled={!fullScreenEnabled}
              onClick={() => {
                const container = containerRef.current
                if (!container) {
                  return
                }
                toggleFullScreen(container)
              }}
              sx={weakWhenFullScreenProps}
            >
              {isFullScreen ? (
                <FullscreenExitIcon sx={{ fontSize: '2em' }} />
              ) : (
                <FullscreenIcon sx={{ fontSize: '2em' }} />
              )}
            </IconButton>
          </Stack>
        </Box>
        {/* 选择颜色 */}
        <>
          <ColorPicker
            title='修改左上角色值'
            sx={{
              ...colorPickerProps,
              left: '0.5em',
              top: '0.5em',
              color: colorToCss(getComplementaryColor(clt), 'hex'),
            }}
            defaultValue={clt}
            onChange={debounce((newColor) => {
              setLt(colorToCss(newColor, 'hex').slice(1))
            }, 500)}
          />
          <ColorPicker
            title='修改右上角色值'
            sx={{
              ...colorPickerProps,
              right: '0.5em',
              top: '0.5em',
              color: colorToCss(getComplementaryColor(crt), 'hex'),
            }}
            defaultValue={crt}
            onChange={debounce((newColor) => {
              setRt(colorToCss(newColor, 'hex').slice(1))
            }, 500)}
          />
          <ColorPicker
            title='修改左下角色值'
            sx={{
              ...colorPickerProps,
              left: '0.5em',
              bottom: '0.5em',
              color: colorToCss(getComplementaryColor(clb), 'hex'),
            }}
            defaultValue={clb}
            onChange={debounce((newColor) => {
              setLb(colorToCss(newColor, 'hex').slice(1))
            }, 500)}
          />
          <ColorPicker
            title='修改右下角色值'
            sx={{
              ...colorPickerProps,
              right: '0.5em',
              bottom: '0.5em',
              color: colorToCss(getComplementaryColor(crb), 'hex'),
            }}
            defaultValue={crb}
            onChange={debounce((newColor) => {
              setRb(colorToCss(newColor, 'hex').slice(1))
            }, 500)}
          />
        </>
      </Box>
    </Box>
  )
}
