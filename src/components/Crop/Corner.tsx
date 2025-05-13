import {
  CORNER_COLOR,
  CORNER_COLOR_HOVER,
  DEPTH,
  CORNER_SIZE,
  CURSOR_MAP,
  ROTATION_MAP,
} from './constants'

import { assertNever } from '@/utils/function'

import { useMemo } from 'react'
import { Box, type BoxProps } from '@mui/material'

import type { CropPlacement, CropAlignmeng } from './constants'

interface CornerProps extends Omit<BoxProps, 'position'> {
  placement: CropPlacement
  alignmeng: CropAlignmeng
  position: {
    x: number
    y: number
  }
}

export function Corner({
  placement,
  alignmeng,
  position: { x, y },
  sx,
  style,
  ...props
}: CornerProps) {
  const posKey = `${placement.h}-${placement.v}` as const

  const tx = useMemo(() => {
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
    if (placement.h === 'middle') {
      switch (alignmeng) {
        case 'outside':
          return 0
        case 'middle':
          return 0
        case 'inside':
          return 0
        default:
          assertNever(alignmeng)
          return 0
      }
    }
    assertNever(placement.h)
    return 0
  }, [placement, alignmeng])

  const ty = useMemo(() => {
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
    if (placement.v === 'middle') {
      switch (alignmeng) {
        case 'outside':
          return 0
        case 'middle':
          return 0
        case 'inside':
          return 0
        default:
          assertNever(alignmeng)
          return 0
      }
    }
    assertNever(placement.v)
    return 0
  }, [placement, alignmeng])

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: (theme) => theme.zIndex.tooltip,
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        overflow: 'visible',
        color: CORNER_COLOR,
        '&:hover': {
          color: CORNER_COLOR_HOVER,
        },
        cursor: CURSOR_MAP[posKey],
        ...sx,
      }}
      style={{
        transform: `translate(${x + tx}px,${y + ty}px) rotate(${ROTATION_MAP[posKey]}deg)`,
        ...style,
      }}
      {...props}
    >
      {/* 一个 svg, 内容是 从 0 往右伸的 高:DEPTH 宽:CORNER_SIZE 长条，再加一个从 0 往下伸的 宽:DEPTH 高:CORNER_SIZE 的长条*/}
      <svg
        viewBox={`0 0 ${CORNER_SIZE} ${CORNER_SIZE}`}
        style={{
          fill: 'currentColor',
          width: CORNER_SIZE,
          height: CORNER_SIZE,
        }}
      >
        <path
          d={`M 0 0 L ${CORNER_SIZE} 0 L ${CORNER_SIZE} ${DEPTH} L ${DEPTH} ${DEPTH} L ${DEPTH} ${CORNER_SIZE} L 0 ${CORNER_SIZE} Z`}
        />
        <path
          d={`M 0 0 L 0 ${CORNER_SIZE} L ${DEPTH} ${CORNER_SIZE} L ${DEPTH} ${DEPTH} L ${CORNER_SIZE} ${DEPTH} L ${CORNER_SIZE} 0 Z`}
        />
      </svg>
    </Box>
  )
}
