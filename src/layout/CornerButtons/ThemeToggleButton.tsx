'use client'

import { usePrefersColorSchema } from '@/common/contexts/PrefersColorSchema'
import { DiffMode } from '@/components/Diff'

import { IconButton, Typography } from '@mui/material'
import { DarkMode, LightMode } from '@mui/icons-material'

export function ThemeToggleButton() {
  return (
    <IconButton
      aria-label='test-2'
      color='inherit'
      onClick={() => {
        usePrefersColorSchema.toggle()
      }}
    >
      <Typography>
        <DiffMode dark={<LightMode />} light={<DarkMode />} />
      </Typography>
    </IconButton>
  )
}
