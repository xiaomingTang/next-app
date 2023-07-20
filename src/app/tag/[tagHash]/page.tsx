import { TagDesc } from '../components/TagDesc'
import { TagList } from '../components/TagList'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlogs } from '@/app/admin/blog/server'
import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Error } from '@/components/Error'
import { getTag, getTags } from '@/app/admin/tag/server'
import { BlogList } from '@/app/blog/components/BlogList'

import { BlogType } from '@prisma/client'

import type { Metadata } from 'next'

interface Props {
  params: { tagHash: string }
}

export async function generateMetadata({
  params: { tagHash },
}: Props): Promise<Metadata> {
  const { data: tag } = await getTag({
    hash: tagHash,
  })

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
  const tagsRes = await getTags({})

  const tagRes = await getTag({
    hash: tagHash,
  })

  const blogsRes = await getBlogs({
    type: BlogType.PUBLISHED,
    tags: {
      some: {
        hash: tagHash,
      },
    },
  })

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <ScrollToTop>
          <>
            {tagsRes?.data && (
              <TagList tags={tagsRes.data} activeTagHash={tagHash} />
            )}
            {tagsRes?.error && <Error {...tagsRes.error} />}
          </>
          <>
            {tagRes?.data && <TagDesc tag={tagRes.data} />}
            {tagRes?.error && <Error {...tagRes.error} />}
          </>
          <>
            {blogsRes.data && <BlogList blogs={blogsRes.data} />}
            {blogsRes.error && <Error {...blogsRes.error} />}
          </>
        </ScrollToTop>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
