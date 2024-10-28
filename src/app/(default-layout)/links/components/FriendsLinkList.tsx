'use client'

import { FriendsLinkItem } from './FriendsLinkItem'

import { shuffledArray7 } from '@/constants'

import { Grid2 } from '@mui/material'

import type { SimpleFriendsLink } from '../server'

export function FriendsLinkList({
  friendsLinks,
}: {
  friendsLinks: SimpleFriendsLink[]
}) {
  return (
    <Grid2
      container
      rowSpacing={{ xs: 1, md: 2 }}
      columnSpacing={{ xs: 1, md: 2 }}
    >
      {friendsLinks.map((rec) => (
        <Grid2 key={rec.hash} size={{ xs: 12, md: 6 }}>
          <FriendsLinkItem {...rec} />
        </Grid2>
      ))}
    </Grid2>
  )
}

export function FriendsLinkListLoading({ count }: { count: number }) {
  return (
    <Grid2
      container
      rowSpacing={{ xs: 1, md: 2 }}
      columnSpacing={{ xs: 1, md: 2 }}
    >
      {shuffledArray7.slice(0, count).map((n, i) => (
        <Grid2 key={i} size={{ xs: 12, md: 6 }}>
          <FriendsLinkItem loading size={n} />
        </Grid2>
      ))}
    </Grid2>
  )
}
