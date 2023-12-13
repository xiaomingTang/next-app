'use client'

import { Hand } from '../../components/Hand'
import { HandsWrapper } from '../../components/HandsWrapper'

import { useNowDate } from '@/hooks/useNow'
import { SvgDial01 } from '@/svg'

import { NoSsr } from '@mui/material'
import { blue, green, pink } from '@mui/material/colors'

export const Dial = SvgDial01

function RawHands() {
  const now = useNowDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  return (
    <HandsWrapper>
      {/* h */}
      <Hand
        center={[103, 100]}
        width={50}
        height={6}
        color={blue[500]}
        degree={((h % 12) + m / 60) * 30 - 90}
      />
      {/* m */}
      <Hand
        center={[103, 100]}
        width={65}
        height={4}
        color={green[500]}
        degree={(m + s / 60) * 6 - 90}
      />
      {/* s */}
      <Hand
        center={[103, 100]}
        width={80}
        height={2}
        color={pink[500]}
        degree={s * 6 - 90}
      />
    </HandsWrapper>
  )
}

export function Hands() {
  return (
    <NoSsr>
      <RawHands />
    </NoSsr>
  )
}
