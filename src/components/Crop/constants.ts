import type { CSSProperties } from '@mui/material'

export const DEPTH = 6
export const CORNER_SIZE = 24
export const ASIDE_SIZE = 40
export const DASH_COLOR = '#ffffff'
export const CROP_BG = 'rgba(255, 255, 255, 0.4)'
export const CORNER_COLOR = '#999999'
export const CORNER_COLOR_HOVER = '#666666'

export type CropAlignmeng = 'outside' | 'middle' | 'inside'
export type CropPlacement = {
  h: 'left' | 'middle' | 'right'
  v: 'top' | 'middle' | 'bottom'
}
export type CropPlacementKey = `${CropPlacement['h']}-${CropPlacement['v']}`

export const CURSOR_MAP: Record<CropPlacementKey, CSSProperties['cursor']> = {
  'left-top': 'nw-resize',
  'right-top': 'ne-resize',
  'left-bottom': 'sw-resize',
  'right-bottom': 'se-resize',
  'middle-top': 'ns-resize',
  'middle-bottom': 'ns-resize',
  'left-middle': 'ew-resize',
  'right-middle': 'ew-resize',
  'middle-middle': 'move',
}

export const ROTATION_MAP: Record<CropPlacementKey, number> = {
  'left-top': 0,
  'right-top': 90,
  'left-bottom': 270,
  'right-bottom': 180,
  'middle-top': 0,
  'middle-bottom': 180,
  'left-middle': 270,
  'right-middle': 90,
  'middle-middle': 0,
}
