'use client'

import { useNowDate } from '@/hooks/useNow'

import { Box } from '@mui/material'

export function CircleClock() {
  const now = useNowDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()

  return (
    <Box>
      {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:
      {s.toString().padStart(2, '0')}
    </Box>
  )
}
