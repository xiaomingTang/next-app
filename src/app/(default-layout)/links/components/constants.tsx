import Span from '@/components/Span'

import type { FriendsLinkStatus } from '@/generated-prisma-client'

export const FriendsLinkStatusMap: Record<
  FriendsLinkStatus,
  {
    name: React.ReactNode
  }
> = {
  ACCEPTED: {
    name: (
      <Span
        sx={{
          color: 'success.main',
          fontWeight: 'bold',
        }}
      >
        [已通过]
      </Span>
    ),
  },
  PENDING: {
    name: (
      <Span
        sx={{
          color: 'warning.main',
          fontWeight: 'bold',
        }}
      >
        [待审核]
      </Span>
    ),
  },
  REJECTED: {
    name: (
      <Span
        sx={{
          color: 'error.main',
          fontWeight: 'bold',
        }}
      >
        [已拒绝]
      </Span>
    ),
  },
}

export const sortedFriendsLinkStatus: FriendsLinkStatus[] = [
  'ACCEPTED',
  'PENDING',
  'REJECTED',
]
