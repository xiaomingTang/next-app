'use client'

import '@/layout/FullscreenLayout.css'

import { colorToCss, getComplementaryColor, toColor } from '../utils/color'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import { Box, IconButton, Stack } from '@mui/material'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import DownloadIcon from '@mui/icons-material/Download'
import PaletteIcon from '@mui/icons-material/Palette'

import type { Color } from '../utils/color'

const defaultColor: Color = [255, 255, 255, 1]

export function WallpaperRoot() {
  const searchParams = useSearchParams()
  const [lt, setLt] = useState(searchParams.get('lt') || 'ffffff')
  const [lb, setLb] = useState(searchParams.get('lb') || 'ffffff')
  const [rt, setRt] = useState(searchParams.get('rt') || 'ffffff')
  const [rb, setRb] = useState(searchParams.get('rb') || 'ffffff')
  const clt = useMemo(() => toColor(`#${lt}`, defaultColor), [lt])
  const clb = useMemo(() => toColor(`#${lb}`, defaultColor), [lb])
  const crt = useMemo(() => toColor(`#${rt}`, defaultColor), [rt])
  const crb = useMemo(() => toColor(`#${rb}`, defaultColor), [rb])

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
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          overflow: 'hidden',
        }}
      >
        <canvas
          style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(to right,${colorToCss(
              clt,
              'hex'
            )},${colorToCss(crt, 'hex')})`,
          }}
        />
        {/* 操作按钮 */}
        <Stack
          direction='row'
          spacing={1}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        >
          <IconButton>
            <DownloadIcon sx={{ fontSize: '2em' }} />
          </IconButton>
          <IconButton>
            <FullscreenIcon sx={{ fontSize: '2em' }} />
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
              top: '0.5em',
              color: colorToCss(getComplementaryColor(crt), 'hex'),
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
