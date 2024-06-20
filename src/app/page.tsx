import { HoverableClock } from './(default-layout)/clock/HoverableClock'
import { Hands } from './(iframe-layout)/clock/components/Hands'
import { DEFAULT_CLOCK_CONFIG } from './(iframe-layout)/clock/theme/[theme]/constants'

import { Clock } from '@I/clock/components/Clock'
import { BlogList, BlogListLoading } from '@D/blog/components/BlogList'
import { TagItem } from '@D/tag/components/TagItem'
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
import { DefaultAside } from '@/layout/DefaultAside'
import { resolvePath } from '@/utils/url'

import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'

import type { Metadata } from 'next'

const { hostname } = resolvePath('/')

export const metadata: Metadata = {
  ...seo.defaults(),
  title: `${seo.title('博客列表页')} | ${hostname} | web技术心得分享`,
  alternates: {
    types: {
      // https://taoshu.in/webfeed/lets-webfeed.html
      'application/rss+xml': [{ url: 'rss.xml', title: 'RSS' }],
    },
  },
}

export default async function Index() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <GA />
        <DefaultAside placement='left'>
          <HoverableClock clockIframePath='/clock/theme/13'>
            <Clock>
              <DEFAULT_CLOCK_CONFIG.Dial width='100%' height='100%' />
              <Hands config={DEFAULT_CLOCK_CONFIG} />
            </Clock>
          </HoverableClock>
        </DefaultAside>
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
