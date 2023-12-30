'use client'

import { dark } from '@/utils/theme'

import { Box, alpha } from '@mui/material'
import { common, red } from '@mui/material/colors'

import type { Color, SxProps } from '@mui/material'

export function LevelLine({
  orientation,
  percentage,
  highlight,
  color = red,
}: {
  orientation: 'vertical' | 'horizontal'
  percentage: number
  highlight: boolean
  color?: Color
}) {
  const size = 1
  const commonLineSx: SxProps = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    background: highlight ? alpha(color[700], 0.75) : alpha(common.black, 0.1),
    [dark()]: {
      background: highlight
        ? alpha(color[700], 0.75)
        : alpha(common.white, 0.1),
    },
  }

  if (orientation === 'horizontal') {
    return (
      <Box
        sx={{
          ...commonLineSx,
          height: `${size}px`,
          top: `${percentage * 100}%`,
          transform: `translateY(-${size / 2}px)`,
        }}
      />
    )
  }
  return (
    <Box
      sx={{
        ...commonLineSx,
        width: `${size}px`,
        left: `${percentage * 100}%`,
        transform: `translateX(-${size / 2}px)`,
      }}
    />
  )
}
