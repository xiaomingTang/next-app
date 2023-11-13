import { getMediaCards } from '../server'
import {
  MediaCardList,
  MediaCardListLoading,
} from '../components/MediaCardList'

import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AlertError } from '@/components/Error'
import { ServerComponent } from '@/components/ServerComponent'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

export const metadata = seo.defaults({
  title: '常见水果的英文表达',
})

export default async function Home() {
  return (
    <ScrollToTop>
      {/* card list */}
      <Suspense fallback={<MediaCardListLoading type='FRUIT' count={8} />}>
        <ServerComponent
          api={unstable_cache(
            () => getMediaCards({ type: 'FRUIT' }),
            ['getMediaCards', 'FRUIT'],
            {
              revalidate: 10,
              tags: ['getMediaCards'],
            }
          )}
          render={(cards) => <MediaCardList type='FRUIT' cards={cards} />}
          errorBoundary={(err) => <AlertError {...err} />}
        />
      </Suspense>
    </ScrollToTop>
  )
}
