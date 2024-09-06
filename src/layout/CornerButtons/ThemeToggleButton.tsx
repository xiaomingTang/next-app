import { dark } from '@/utils/theme'

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
      <LightModeIcon
        sx={{ display: 'inline-block', [dark()]: { display: 'none' } }}
      />
      <DarkModeIcon
        sx={{ display: 'none', [dark()]: { display: 'inline-block' } }}
      />
    </IconButton>
  )
}
