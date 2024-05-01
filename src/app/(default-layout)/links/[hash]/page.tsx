import {
  FriendsLinkDesc,
  FriendsLinkSection,
} from '../components/FriendsLinkDesc'
import {
  FriendsLinkList,
  FriendsLinkListLoading,
} from '../components/FriendsLinkList'
import { getFriendsLinks } from '../server'
import { sortedFriendsLinkStatus } from '../components/constants'

import { seo } from '@/utils/seo'
import { ServerComponent } from '@/components/ServerComponent'
import { AlertError } from '@/components/Error'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import Divider from '@mui/material/Divider'

import type { FriendsLinkStatus } from '@prisma/client'

export const metadata = seo.defaults({
  title: '友链',
})

interface Props {
  params: {
    /**
     * hash 既可能是 FriendsLinkStatus, 也可能是 FriendsLink.hash
     */
    hash: string
  }
}

function toFriendsLinkStatus(s: string): FriendsLinkStatus | null {
  if (sortedFriendsLinkStatus.includes(s.toUpperCase() as FriendsLinkStatus)) {
    return s.toUpperCase() as FriendsLinkStatus
  }
  return null
}

/**
 * hash:
 *   - 'ACCEPTED': 已接受的所有 hash
 *   - 'PENDING': 待处理的所有 hash
 *   - 'REJECTED': 已接受的所有 hash
 *   - 其他任意特定 hash
 */
export default async function Index({ params: { hash } }: Props) {
  // 注意, 这个变量不是 status, 需要使用时自行判断
  const status = toFriendsLinkStatus(hash)
  return (
    <>
      <FriendsLinkDesc />
      <Divider sx={{ my: 2 }} />
      <FriendsLinkSection activeHash={hash}>
        <Suspense fallback={<FriendsLinkListLoading count={8} />}>
          <ServerComponent
            api={unstable_cache(
              () =>
                status
                  ? getFriendsLinks({
                      status,
                    })
                  : getFriendsLinks({
                      hash,
                    }),
              ['getFriendsLinks', hash],
              {
                revalidate: 10,
                tags: ['getFriendsLinks'],
              }
            )}
            render={(cards) => <FriendsLinkList friendsLinks={cards} />}
            errorBoundary={(err) => <AlertError {...err} />}
          />
        </Suspense>
      </FriendsLinkSection>
    </>
  )
}
