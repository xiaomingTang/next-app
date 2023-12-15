import { MediaCardItem, MediaCardUploadTrigger } from './MediaCardItem'

import { shuffledArray7 } from '@/constants'
import { AuthRequired } from '@/components/AuthRequired'

import Grid from '@mui/material/Grid'

import type { MediaCardType } from '@prisma/client'
import type { MediaCardWithUser } from '../server'

export function MediaCardList({
  cards,
  type,
}: {
  cards: MediaCardWithUser[]
  type: MediaCardType
}) {
  return (
    <Grid
      container
      rowSpacing={{ xs: 1, md: 2 }}
      columnSpacing={{ xs: 1, md: 2 }}
    >
      {cards.map((rec) => (
        <Grid item key={rec.hash} xs={12} md={6}>
          <MediaCardItem {...rec} />
        </Grid>
      ))}
      <AuthRequired silence roles={['ADMIN']}>
        <Grid item key='upload' xs={12} md={6}>
          <MediaCardUploadTrigger type={type} />
        </Grid>
      </AuthRequired>
    </Grid>
  )
}

export function MediaCardListLoading({
  count,
  type,
}: {
  count: number
  type: MediaCardType
}) {
  return (
    <Grid
      container
      rowSpacing={{ xs: 1, md: 2 }}
      columnSpacing={{ xs: 1, md: 2 }}
    >
      {shuffledArray7.slice(0, count).map((n, i) => (
        <Grid item key={i} xs={12} md={6}>
          <MediaCardItem loading size={n} />
        </Grid>
      ))}
      <AuthRequired silence roles={['ADMIN']}>
        <Grid item key='upload' xs={12} md={6}>
          <MediaCardUploadTrigger type={type} />
        </Grid>
      </AuthRequired>
    </Grid>
  )
}
