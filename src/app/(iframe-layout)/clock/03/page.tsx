'use client'

import Clock from '../components/svgs/clock-03.svg?icon'
import { Hand } from '../components/Hand'
import { HandsWrapper } from '../components/HandsWrapper'

import { useNowDate } from '@/hooks/useNow'

import { Box, NoSsr } from '@mui/material'
import { blue, green, pink } from '@mui/material/colors'

function RawIndex() {
  const now = useNowDate()
  const h = now.getHours()
  const m = now.getMinutes()
  const s = now.getSeconds()
  const size = 300

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        '--bg': '#eee',
      }}
    >
      <Clock width='100%' height='100%' />
      <HandsWrapper>
        {/* h */}
        <Hand
          center={[100, 100]}
          width={20}
          height={6}
          color={blue[500]}
          degree={(h % 12) * 30 - 90}
        />
        {/* m */}
        <Hand
          center={[100, 100]}
          width={25}
          height={4}
          color={green[500]}
          degree={(m % 60) * 6 - 90}
        />
        {/* s */}
        <Hand
          center={[100, 100]}
          width={30}
          height={2}
          color={pink[500]}
          degree={(s % 60) * 6 - 90}
        />
      </HandsWrapper>
    </Box>
  )
}

export default function Index() {
  return (
    <NoSsr>
      <RawIndex />
    </NoSsr>
  )
}
