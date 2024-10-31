'use client'

import { Grids } from './Grids'
import { useSlide } from './useSlide'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { useElementSize } from '@/hooks/useElementSize'

import RedoIcon from '@mui/icons-material/Redo'
import UndoIcon from '@mui/icons-material/Undo'
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

  const [size, _canvas, setCanvas] = useElementSize<HTMLCanvasElement>()

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
          sx={{
            flex: '1 1 0%',
            position: 'relative',
          }}
        >
          <canvas
            ref={setCanvas}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#2E2E2D',
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
          color: 'white',
          '& :disabled': {
            color: 'rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <IconButton disabled>
          <UndoIcon />
        </IconButton>
        <IconButton tabIndex={-1} style={{ color }}>
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
        <IconButton disabled>
          <RedoIcon />
        </IconButton>
      </ButtonGroup>
    </>
  )
}
