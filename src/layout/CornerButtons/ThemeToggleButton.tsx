'use client'

import { usePrefersColorSchema } from '@/common/contexts/PrefersColorSchema'
import { DiffMode } from '@/components/Diff'

import { IconButton, Typography } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

export function ThemeToggleButton() {
  return (
    <IconButton
      aria-label='test-2'
      onClick={() => {
        usePrefersColorSchema.toggle()
      }}
    >
      <Typography>
        <DiffMode dark={<LightModeIcon />} light={<DarkModeIcon />} />
      </Typography>
    </IconButton>
  )
}
