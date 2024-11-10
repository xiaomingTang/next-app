'use client'

import { Grids } from './Grids'
import { useSlide } from './useSlide'
import { KaleidoscopeCanvas } from './KaleidoscopeCanvas'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { useElementSize } from '@/hooks/useElementSize'
import { AnchorProvider } from '@/components/AnchorProvider'

import CancelIcon from '@mui/icons-material/Cancel'
import PaletteIcon from '@mui/icons-material/Palette'
import LensBlurIcon from '@mui/icons-material/LensBlur'
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'

export function Kaleidoscope() {
  const {
    value: gridSize,
    isSetting: isSettingGridSize,
    onStart,
  } = useSlide({
    direction: 'x',
    defaultValue: 100,
    min: 50,
    max: 200,
  })
  const [color, setColor] = useState('#ffffff')
  const CLEAR_COLOR = '#2E2E2D'
  const [canvasKey, setCanvasKey] = useState(0)

  const [size, _elem, setElement] = useElementSize<HTMLElement>()

  const clearCanvasButton = (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <span
            style={{
              display: 'inline-flex',
            }}
          >
            <Tooltip
              open={!!anchorEl}
              title={
                <Stack direction='row' alignItems='center'>
                  <Typography>确认清空画布吗？</Typography>
                  <Button
                    color='error'
                    variant='contained'
                    size='small'
                    onClick={() => {
                      setCanvasKey((key) => key + 1)
                      setAnchorEl(null)
                    }}
                  >
                    清空
                  </Button>
                </Stack>
              }
            >
              <IconButton
                aria-label='清空画布'
                onClick={(e) => {
                  setAnchorEl((prev) => {
                    if (!prev) {
                      return e.currentTarget
                    }
                    return null
                  })
                }}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </span>
        </ClickAwayListener>
      )}
    </AnchorProvider>
  )

  return (
    <>
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
          ref={setElement}
          sx={{
            flex: '1 1 0%',
            position: 'relative',
          }}
        >
          <KaleidoscopeCanvas
            key={canvasKey}
            gridSize={gridSize}
            strokeWidth={1}
            strokeColor={color}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: CLEAR_COLOR,
              touchAction: 'none',
            }}
          />
          {size.width > 0 && (
            <Grids
              width={size.width}
              height={size.height}
              gridSize={gridSize}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                stroke: `rgba(255, 255, 255, ${isSettingGridSize ? 0.1 : 0})`,
                transition: `stroke ${isSettingGridSize ? 0.1 : 3}s`,
                pointerEvents: 'none',
              }}
            />
          )}
        </Box>
      </Box>
      <ButtonGroup
        sx={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          color,
          '& :disabled': {
            color: 'rgba(255, 255, 255, 0.2)',
          },
          '& button': {
            backgroundColor: CLEAR_COLOR,
          },
        }}
      >
        <IconButton tabIndex={-1} aria-label='选择画笔颜色'>
          <PaletteIcon />
          <input
            type='color'
            onChange={(e) => setColor(e.target.value)}
            style={{
              opacity: 0,
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          />
        </IconButton>
        <IconButton
          onMouseDown={onStart}
          onTouchStart={onStart}
          aria-label='调整格栅间隔'
        >
          <LensBlurIcon />
        </IconButton>
        {clearCanvasButton}
      </ButtonGroup>
    </>
  )
}
