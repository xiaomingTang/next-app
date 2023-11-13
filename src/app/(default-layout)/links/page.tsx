import {
  FriendsLinkDesc,
  FriendsLinkSection,
} from './components/FriendsLinkDesc'
import {
  FriendsLinkList,
  FriendsLinkListLoading,
} from './components/FriendsLinkList'
import { getFriendsLinks } from './server'

import { seo } from '@/utils/seo'
import { ServerComponent } from '@/components/ServerComponent'
import { AlertError } from '@/components/Error'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { Divider } from '@mui/material'

export const metadata = seo.defaults({
  title: '友链',
})

export default async function Home() {
  return (
    <>
      <FriendsLinkDesc />
      <Divider sx={{ my: 2 }} />
      <FriendsLinkSection>
        <Suspense fallback={<FriendsLinkListLoading count={8} />}>
          <ServerComponent
            api={unstable_cache(
              () =>
                getFriendsLinks({
                  status: 'ACCEPTED',
                }),
              ['getFriendsLinks'],
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
