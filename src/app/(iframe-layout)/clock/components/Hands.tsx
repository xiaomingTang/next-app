'use client'

import { Hand } from './Hand'
import { HandsWrapper } from './HandsWrapper'

import { useNowDate } from '@/hooks/useNow'

import { blue, green, pink } from '@mui/material/colors'
import { NoSsr } from '@mui/material'

import type { ClockConfig } from '../theme/[theme]/constants'

interface HandsProps {
  config: Pick<ClockConfig, 'center' | 'h' | 'm' | 's'>
}

function RawHands({ config }: HandsProps) {
  const now = useNowDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  return (
    <HandsWrapper>
      {/* h */}
      <Hand
        {...config.h}
        center={config.center}
        color={blue[500]}
        degree={((h % 12) + m / 60) * 30 - 90}
      />
      {/* m */}
      <Hand
        {...config.m}
        center={config.center}
        color={green[500]}
        degree={(m + s / 60) * 6 - 90}
      />
      {/* s */}
      <Hand
        {...config.s}
        center={config.center}
        color={pink[500]}
        degree={s * 6 - 90}
      />
    </HandsWrapper>
  )
}

export function Hands({ config }: HandsProps) {
  return (
    <NoSsr>
      <RawHands config={config} />
    </NoSsr>
  )
}
