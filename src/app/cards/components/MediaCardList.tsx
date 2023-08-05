'use client'

import { MediaCardItem, MediaCardUploadTrigger } from './MediaCardItem'

import { shuffledArray7 } from '@/constants'
import { AuthRequired } from '@/components/AuthRequired'

import { Grid } from '@mui/material'

import type { MediaCardWithUser } from '../server'

export function MediaCardList({ cards }: { cards: MediaCardWithUser[] }) {
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
          <MediaCardUploadTrigger />
        </Grid>
      </AuthRequired>
    </Grid>
  )
}

export function MediaCardListLoading({ count }: { count: number }) {
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
          <MediaCardUploadTrigger />
        </Grid>
      </AuthRequired>
    </Grid>
  )
}
