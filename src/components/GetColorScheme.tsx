'use client'

import { getInitColorSchemeScript } from '@mui/material/styles'

export function GetInitColorSchemeScript() {
  return getInitColorSchemeScript({
    defaultMode: 'light',
  })
}
