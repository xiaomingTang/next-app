import { DiffMode } from '@/components/Diff'

import { IconButton, useColorScheme } from '@mui/material'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'

export function ThemeToggleButton() {
  const { mode, setMode } = useColorScheme()
  return (
    <IconButton
      aria-label='深色模式切换'
      onClick={() => {
        setMode(mode === 'dark' ? 'light' : 'dark')
      }}
    >
      <DiffMode dark={<LightModeIcon />} light={<DarkModeIcon />} />
    </IconButton>
  )
}
