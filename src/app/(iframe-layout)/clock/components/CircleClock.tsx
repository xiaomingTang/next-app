'use client'

import Clock from './svgs/时钟-万花筒-皇冠.svg?icon'

import { useNowDate } from '@/hooks/useNow'

import { Box, NoSsr } from '@mui/material'

export function RawCircleClock() {
  const now = useNowDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()

  return (
    <Box>
      {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:
      {s.toString().padStart(2, '0')}
      <Clock width={300} height={300} />
    </Box>
  )
}

export function CircleClock() {
  return (
    <NoSsr>
      <RawCircleClock />
    </NoSsr>
  )
}
