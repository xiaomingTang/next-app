import {
  CORNER_COLOR,
  CORNER_COLOR_HOVER,
  DEPTH,
  CURSOR_MAP,
  ROTATION_MAP,
  ASIDE_SIZE,
} from './constants'

import { assertNever } from '@/utils/function'

import { useMemo } from 'react'
import { Box, type BoxProps } from '@mui/material'

import type { CropPlacement, CropAlignmeng } from './constants'

interface AsideProps extends Omit<BoxProps, 'position'> {
  placement: CropPlacement
  alignmeng: CropAlignmeng
  position: {
    x: number
    y: number
  }
}

export function Aside({
  placement,
  alignmeng,
  position: { x, y },
  sx,
  style,
  ...props
}: AsideProps) {
  const posKey = `${placement.h}-${placement.v}` as const

  const tx = useMemo(() => {
    if (placement.h === 'middle') {
      return 0
    }
    if (placement.h === 'left') {
      switch (alignmeng) {
        case 'outside':
          return -DEPTH
        case 'middle':
          return -DEPTH / 2
        case 'inside':
          return 0
        default:
          assertNever(alignmeng)
          return 0
      }
    }
    if (placement.h === 'right') {
      switch (alignmeng) {
        case 'outside':
          return DEPTH
        case 'middle':
          return DEPTH / 2
        case 'inside':
          return 0
        default:
          assertNever(alignmeng)
          return 0
      }
    }
    assertNever(placement.h)
    return 0
  }, [placement.h, alignmeng])

  const ty = useMemo(() => {
    if (placement.v === 'middle') {
      return 0
    }
    if (placement.v === 'top') {
      switch (alignmeng) {
        case 'outside':
          return -DEPTH
        case 'middle':
          return -DEPTH / 2
        case 'inside':
          return 0
        default:
          assertNever(alignmeng)
          return 0
      }
    }
    if (placement.v === 'bottom') {
      switch (alignmeng) {
        case 'outside':
          return DEPTH
        case 'middle':
          return DEPTH / 2
        case 'inside':
          return 0
        default:
          assertNever(alignmeng)
          return 0
      }
    }
    assertNever(placement.v)
    return 0
  }, [placement.v, alignmeng])

  return (
    <Box
      sx={{
        position: 'absolute',
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        color: CORNER_COLOR,
        cursor: CURSOR_MAP[posKey],
        overflow: 'visible',
        '&:hover': {
          color: CORNER_COLOR_HOVER,
        },
        touchAction: 'none',
        ...sx,
      }}
      style={{
        transform: `translate(${x + tx}px,${y + ty}px) rotate(${ROTATION_MAP[posKey]}deg)`,
        ...style,
      }}
      {...props}
    >
      <Box
        sx={{
          position: 'absolute',
          width: ASIDE_SIZE,
          height: DEPTH,
          backgroundColor: 'currentColor',
        }}
        style={{
          transform: `translateX(-50%)`,
        }}
      />
    </Box>
  )
}
