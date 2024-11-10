'use client'

import { Grids } from './Grids'
import { useSlide } from './useSlide'
import { KaleidoscopeCanvas } from './KaleidoscopeCanvas'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { useElementSize } from '@/hooks/useElementSize'

import CancelIcon from '@mui/icons-material/Cancel'
import PaletteIcon from '@mui/icons-material/Palette'
import LensBlurIcon from '@mui/icons-material/LensBlur'
import { Box, ButtonGroup, IconButton } from '@mui/material'
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
  const clearCanvas = () => setCanvasKey((key) => key + 1)

  const [size, _elem, setElement] = useElementSize<HTMLElement>()

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
                stroke: `rgba(255, 255, 255, 0.1)`,
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
        <IconButton tabIndex={-1}>
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
        <IconButton onMouseDown={onStart} onTouchStart={onStart}>
          <LensBlurIcon />
        </IconButton>
        <IconButton onClick={clearCanvas}>
          <CancelIcon />
        </IconButton>
      </ButtonGroup>
    </>
  )
}
