import { BlogContent } from '../components/BlogContent'
import { BlogList, BlogListLoading } from '../components/BlogList'
import { RecommendSep } from '../components/RecommendSep'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import {
  getBlog,
  getBlogWithSource,
  getRecommendBlogs,
} from '@/app/admin/blog/server'
import { Error } from '@/components/Error'
import { seo } from '@/utils/seo'
import { ServerComponent } from '@/components/ServerComponent'

import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'

import type { Metadata } from 'next'

interface Props {
  params: { blogHash: string }
}

export async function generateMetadata({
  params: { blogHash },
}: Props): Promise<Metadata> {
  const { data: blog } = await unstable_cache(
    () =>
      getBlog({
        hash: blogHash,
      }),
    ['getBlog', blogHash],
    {
      revalidate: 300,
    }
  )()

  return seo.defaults({
    title: blog?.title,
    description: blog?.description,
    keywords: [
      ...(blog?.tags.map((tag) => tag.name) ?? []),
      ...(blog?.tags.map((tag) => tag.description) ?? []),
    ].join(','),
  })
}

export default async function Home({ params: { blogHash } }: Props) {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <Suspense fallback={<BlogContent loading size={5} />}>
          <ServerComponent
            api={() => getBlogWithSource(blogHash)}
            render={(blog) => <BlogContent {...blog} />}
            errorBoundary={(err) => <Error {...err} />}
          />
        </Suspense>
        <RecommendSep />
        {/* 推荐列表 */}
        <Suspense fallback={<BlogListLoading count={3} />}>
          <ServerComponent
            api={() => getRecommendBlogs(blogHash)}
            render={(data) => <BlogList blogs={data} />}
            errorBoundary={(err) => <Error {...err} />}
          />
        </Suspense>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
