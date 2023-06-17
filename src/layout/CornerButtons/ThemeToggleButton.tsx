'use client'

import { usePrefersColorSchema } from '@/common/contexts/PrefersColorSchema'

import { IconButton, Typography } from '@mui/material'
import { DarkMode, LightMode } from '@mui/icons-material'

export function ThemeToggleButton() {
  const { mode } = usePrefersColorSchema()

  return (
    <IconButton
      aria-label='test-2'
      onClick={() => {
        usePrefersColorSchema.toggle()
      }}
    >
      <Typography>{mode === 'dark' ? <LightMode /> : <DarkMode />}</Typography>
    </IconButton>
  )
}
