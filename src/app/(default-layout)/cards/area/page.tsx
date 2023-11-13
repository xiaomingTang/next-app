import { getMediaCards } from '../server'
import {
  MediaCardList,
  MediaCardListLoading,
} from '../components/MediaCardList'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AlertError } from '@/components/Error'
import { ServerComponent } from '@/components/ServerComponent'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

export const metadata = seo.defaults({
  title: '国家和地区',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <ScrollToTop>
          {/* card list */}
          <Suspense fallback={<MediaCardListLoading type='AREA' count={8} />}>
            <ServerComponent
              api={unstable_cache(
                () => getMediaCards({ type: 'AREA' }),
                ['getMediaCards', 'AREA'],
                {
                  revalidate: 10,
                  tags: ['getMediaCards'],
                }
              )}
              render={(cards) => <MediaCardList type='AREA' cards={cards} />}
              errorBoundary={(err) => <AlertError {...err} />}
            />
          </Suspense>
        </ScrollToTop>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
