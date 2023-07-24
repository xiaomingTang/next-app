import { BlogList, BlogListLoading } from './blog/components/BlogList'
import { getTags } from './admin/tag/server'
import { TagItem } from './tag/components/TagItem'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlogs } from '@/app/admin/blog/server'
import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Error } from '@/components/Error'
import { ServerComponent } from '@/components/ServerComponent'
import { shuffledArray7 } from '@/constants'

import { BlogType } from '@prisma/client'
import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

export const metadata = seo.defaults({
  title: '博客列表页',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
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
                revalidate: 300,
                tags: ['getTags'],
              })}
              render={(tags) =>
                tags.map((tag) => (
                  <TagItem
                    key={tag.hash}
                    {...tag}
                    active
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))
              }
              errorBoundary={(err) => <Error {...err} />}
            />
          </Suspense>
          <div style={{ paddingBottom: '8px', pointerEvents: 'none' }} />
          {/* blog list */}
          <Suspense fallback={<BlogListLoading count={8} />}>
            <ServerComponent
              api={unstable_cache(
                () =>
                  getBlogs({
                    type: BlogType.PUBLISHED,
                  }),
                ['getBlogs', BlogType.PUBLISHED],
                {
                  revalidate: 300,
                  tags: ['getBlogs'],
                }
              )}
              render={(data) => <BlogList blogs={data} />}
              errorBoundary={(err) => <Error {...err} />}
            />
          </Suspense>
        </ScrollToTop>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
