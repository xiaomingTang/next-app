'use client'

import { Typography } from '@mui/material'
import SellIcon from '@mui/icons-material/Sell'

import type { Tag } from '@prisma/client'

export function TagDesc({ tag }: { tag: Tag }) {
  return (
    <Typography sx={{ pb: 2 }}>
      <Typography component='b' sx={{ fontWeight: 'bold', color: 'Highlight' }}>
        <SellIcon fontSize='inherit' /> {tag.name}
      </Typography>
      : {tag.description}
    </Typography>
  )
}
