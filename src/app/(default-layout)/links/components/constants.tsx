import { Typography } from '@mui/material'

import type { FriendsLinkStatus } from '@prisma/client'

export const FriendsLinkStatusMap: Record<
  FriendsLinkStatus,
  {
    name: React.ReactNode
  }
> = {
  ACCEPTED: {
    name: (
      <Typography
        component='span'
        sx={{
          color: 'success.main',
          fontWeight: 'bold',
        }}
      >
        [已通过]
      </Typography>
    ),
  },
  PENDING: {
    name: (
      <Typography
        component='span'
        sx={{
          color: 'warning.main',
          fontWeight: 'bold',
        }}
      >
        [待审核]
      </Typography>
    ),
  },
  REJECTED: {
    name: (
      <Typography
        component='span'
        sx={{
          color: 'error.main',
          fontWeight: 'bold',
        }}
      >
        [已拒绝]
      </Typography>
    ),
  },
}

export const sortedFriendsLinkStatus: FriendsLinkStatus[] = [
  'ACCEPTED',
  'PENDING',
  'REJECTED',
]
