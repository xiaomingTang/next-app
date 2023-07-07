'use client'

import { DiffMode } from '@/components/Diff'

import { IconButton, Typography, useColorScheme } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

export function ThemeToggleButton() {
  const { mode, setMode } = useColorScheme()
  return (
    <IconButton
      aria-label='test-2'
      onClick={() => {
        setMode(mode === 'dark' ? 'light' : 'dark')
      }}
    >
      <Typography>
        <DiffMode dark={<LightModeIcon />} light={<DarkModeIcon />} />
      </Typography>
    </IconButton>
  )
}
