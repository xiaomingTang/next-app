import { TagDesc } from '../components/TagDesc'
import { TagItem } from '../components/TagItem'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlogs } from '@/app/admin/blog/server'
import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Error } from '@/components/Error'
import { getTag, getTags } from '@/app/admin/tag/server'
import { BlogList, BlogListLoading } from '@/app/blog/components/BlogList'
import { shuffledArray7 } from '@/constants'
import { ServerComponent } from '@/components/ServerComponent'
import { FESEO } from '@/components/FESEO'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

import type { Metadata } from 'next'

interface Props {
  params: { tagHash: string }
}

export async function generateMetadata({
  params: { tagHash },
}: Props): Promise<Metadata> {
  const { data: tag } = await unstable_cache(
    () =>
      getTag({
        hash: tagHash,
      }),
    ['getTag', tagHash],
    {
      revalidate: 10,
      tags: [`getTag:${tagHash}`],
    }
  )()

  const { name, description } = tag ?? {}

  return seo.defaults({
    title: name && `标签: ${name}`,
    description:
      description &&
      (name ? `与${name}有关的文章: ${description}` : description),
    keywords: name,
  })
}

export default async function Home({ params: { tagHash } }: Props) {
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
                revalidate: 10,
                tags: ['getTags'],
              })}
              render={(tags) =>
                tags.map((tag) => (
                  <TagItem
                    {...tag}
                    key={tag.hash}
                    active={tag.hash === tagHash}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))
              }
              errorBoundary={(err) => <Error {...err} />}
            />
          </Suspense>

          {/* tag desc */}
          <Suspense fallback={<TagDesc loading size={5} />}>
            <ServerComponent
              api={unstable_cache(
                () =>
                  getTag({
                    hash: tagHash,
                  }),
                ['getTag', tagHash],
                {
                  revalidate: 10,
                  tags: [`getTag:${tagHash}`],
                }
              )}
              render={(data) => (
                <>
                  <TagDesc {...data} />
                  <FESEO
                    title={`标签: ${data.name}`}
                    description={`与${data.name}有关的文章: ${data.description}`}
                    keywords={data.name}
                  />
                </>
              )}
              errorBoundary={(err) => <Error {...err} />}
            />
          </Suspense>

          {/* blog list */}
          <Suspense fallback={<BlogListLoading count={8} />}>
            <ServerComponent
              api={unstable_cache(
                () =>
                  getBlogs({
                    type: 'PUBLISHED',
                    tags: {
                      some: {
                        hash: tagHash,
                      },
                    },
                  }),
                ['getBlogs', 'PUBLISHED', tagHash],
                {
                  revalidate: 10,
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
