import { colorToCss, toColor } from '../utils/color'

import { ButtonBase } from '@mui/material'
import PaletteIcon from '@mui/icons-material/Palette'

import type { Color } from '../utils/color'
import type { SxProps, Theme } from '@mui/material'

export function ColorPicker({
  sx,
  title,
  defaultValue,
  onChange,
}: {
  sx: SxProps<Theme>
  title: string
  defaultValue?: Color
  onChange?: (newColor: Color) => void
}) {
  return (
    <ButtonBase
      aria-label={title}
      title={title}
      component='label'
      focusRipple
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          ;(e.target as HTMLLabelElement)
            .getElementsByTagName('input')[0]
            ?.click()
        }
      }}
      sx={sx}
    >
      <PaletteIcon />
      <input
        type='color'
        tabIndex={-1}
        defaultValue={defaultValue && colorToCss(defaultValue, 'hex')}
        style={{ width: 0, height: 0, overflow: 'hidden' }}
        onChange={(e) => {
          onChange?.(toColor(e.target.value))
        }}
      />
    </ButtonBase>
  )
}
