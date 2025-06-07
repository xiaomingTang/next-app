import { TagDesc } from '../components/TagDesc'
import { TagItem } from '../components/TagItem'
import { TagsCollapse } from '../components/TagsCollapse'

import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AlertError } from '@/components/Error'
import { BlogList, BlogListLoading } from '@D/blog/components/BlogList'
import { shuffledArray7 } from '@/constants'
import { ServerComponent } from '@/components/ServerComponent'
import { FESEO } from '@/components/FESEO'
import { getTag, getTags } from '@ADMIN/tag/server'
import { getBlogs } from '@ADMIN/blog/server'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

import type { Metadata } from 'next'

interface Params {
  tagHash: string
}

interface Props {
  params: Promise<Params>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  const { tagHash } = params

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

export default async function Index(props: Props) {
  const params = await props.params

  const { tagHash } = params

  return (
    <ScrollToTop>
      {/* tag list */}
      <TagsCollapse height={['80px', '350px']} defaultOpen={false}>
        <Suspense
          fallback={
            <>
              {shuffledArray7.slice(0, 15).map((n, i) => (
                <TagItem
                  key={i}
                  loading
                  size={n}
                  sx={{ mr: '4px', mb: '4px' }}
                />
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
                  sx={{ mr: '4px', mb: '4px' }}
                />
              ))
            }
            errorBoundary={(err) => <AlertError {...err} />}
          />
        </Suspense>
      </TagsCollapse>

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
          errorBoundary={(err) => <AlertError {...err} />}
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
          errorBoundary={(err) => <AlertError {...err} />}
        />
      </Suspense>
    </ScrollToTop>
  )
}
