import { getMediaCards } from './server'
import { MediaCardList, MediaCardListLoading } from './components/MediaCardList'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Error } from '@/components/Error'
import { ServerComponent } from '@/components/ServerComponent'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

export const metadata = seo.defaults({
  title: '常见水果的英文表达',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <ScrollToTop>
          {/* card list */}
          <Suspense fallback={<MediaCardListLoading count={8} />}>
            <ServerComponent
              api={unstable_cache(
                () => getMediaCards({ type: 'FRUIT' }),
                ['getMediaCards', 'FRUIT'],
                {
                  revalidate: 10,
                  tags: ['getMediaCards'],
                }
              )}
              render={(cards) => <MediaCardList cards={cards} />}
              errorBoundary={(err) => <Error {...err} />}
            />
          </Suspense>
        </ScrollToTop>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
