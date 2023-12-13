'use client'

import Dial from '../../components/svgs/dial-11.svg?icon'
import { Hand } from '../../components/Hand'
import { HandsWrapper } from '../../components/HandsWrapper'

import { useNowDate } from '@/hooks/useNow'

import { NoSsr } from '@mui/material'
import { blue, green, pink } from '@mui/material/colors'

export { Dial }

function RawHands() {
  const now = useNowDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  return (
    <HandsWrapper>
      {/* h */}
      <Hand
        center={[99, 105]}
        width={15}
        height={6}
        color={blue[500]}
        degree={(h % 12) * 30 - 90}
      />
      {/* m */}
      <Hand
        center={[99, 105]}
        width={20}
        height={4}
        color={green[500]}
        degree={(m % 60) * 6 - 90}
      />
      {/* s */}
      <Hand
        center={[99, 105]}
        width={25}
        height={2}
        color={pink[500]}
        degree={(s % 60) * 6 - 90}
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

export default function Index() {
  return (
    <>
      <Dial width='100%' height='100%' />
      <Hands />
    </>
  )
}
