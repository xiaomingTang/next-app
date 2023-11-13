import {
  BlogList,
  BlogListLoading,
} from './(default-layout)/blog/components/BlogList'
import { TagItem } from './(default-layout)/tag/components/TagItem'

import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AlertError } from '@/components/Error'
import { ServerComponent } from '@/components/ServerComponent'
import { shuffledArray7 } from '@/constants'
import { getTags } from '@ADMIN/tag/server'
import { getBlogs } from '@ADMIN/blog/server'
import { GA } from '@/analytics/GA'
import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'

import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'

export const metadata = seo.defaults({
  title: '博客列表页',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <GA />
        <ScrollToTop>
          {/* tag list */}
          <Suspense
            fallback={
              <>
                {shuffledArray7.slice(0, 15).map((n, i) => (
                  <TagItem key={i} loading size={n} sx={{ mr: 1, mb: 1 }} />
                ))}
              </>
            }
          >
            <ServerComponent
              api={unstable_cache(() => getTags({}), ['getTags'], {
                revalidate: 10,
                tags: ['getTags'],
              })}
              render={(tags) =>
                tags.map((tag) => (
                  <TagItem
                    {...tag}
                    key={tag.hash}
                    active
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))
              }
              errorBoundary={(err) => <AlertError {...err} />}
            />
          </Suspense>
          <div style={{ paddingBottom: '8px', pointerEvents: 'none' }} />
          {/* blog list */}
          <Suspense fallback={<BlogListLoading count={8} />}>
            <ServerComponent
              api={unstable_cache(
                () =>
                  getBlogs({
                    type: 'PUBLISHED',
                  }),
                ['getBlogs', 'PUBLISHED'],
                {
                  revalidate: 10,
                  tags: ['getBlogs'],
                }
              )}
              render={(data) => <BlogList blogs={data} />}
              errorBoundary={(err) => <AlertError {...err} />}
            />
          </Suspense>
        </ScrollToTop>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
