'use client'

import { clocks } from './constants'

import { Box, Stack } from '@mui/material'

export default function Index() {
  return (
    <Stack spacing={1} direction='row' useFlexGap flexWrap='wrap'>
      {clocks.map((item) => (
        <Box key={item.index}>{item.component}</Box>
      ))}
    </Stack>
  )
}
