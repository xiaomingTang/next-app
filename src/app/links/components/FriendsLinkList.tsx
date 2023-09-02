'use client'

import { FriendsLinkItem } from './FriendsLinkItem'

import { shuffledArray7 } from '@/constants'

import { Grid } from '@mui/material'

import type { SimpleFriendsLink } from '../server'

export function FriendsLinkList({
  friendsLinks,
}: {
  friendsLinks: SimpleFriendsLink[]
}) {
  return (
    <Grid
      container
      rowSpacing={{ xs: 1, md: 2 }}
      columnSpacing={{ xs: 1, md: 2 }}
    >
      {friendsLinks.map((rec) => (
        <Grid item key={rec.hash} xs={12} md={6}>
          <FriendsLinkItem {...rec} />
        </Grid>
      ))}
    </Grid>
  )
}

export function FriendsLinkListLoading({ count }: { count: number }) {
  return (
    <Grid
      container
      rowSpacing={{ xs: 1, md: 2 }}
      columnSpacing={{ xs: 1, md: 2 }}
    >
      {shuffledArray7.slice(0, count).map((n, i) => (
        <Grid item key={i} xs={12} md={6}>
          <FriendsLinkItem loading size={n} />
        </Grid>
      ))}
    </Grid>
  )
}
