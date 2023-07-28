import { BlogContent } from '../components/BlogContent'
import { BlogList, BlogListLoading } from '../components/BlogList'
import { RecommendSep } from '../components/RecommendSep'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlog, getRecommendBlogs } from '@/app/admin/blog/server'
import { Error } from '@/components/Error'
import { seo } from '@/utils/seo'
import { ServerComponent } from '@/components/ServerComponent'
import { SA } from '@/errors/utils'
import { FESEO } from '@/components/FESEO'

import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import { serialize } from 'next-mdx-remote/serialize'

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
      tags: [`getBlog:${blogHash}`],
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

const getBlogWithSource = SA.encode(async (blogHash: string) => {
  const blog = await getBlog({
    hash: blogHash,
  }).then(SA.decode)
  return {
    ...blog,
    source: await serialize(blog.content ?? '', {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          [
            rehypePrism,
            {
              showLineNumbers: true,
              ignoreMissing: true,
              defaultLanguage: 'txt',
            },
          ],
        ],
        format: 'md',
      },
    }),
  }
})

export default async function Home({ params: { blogHash } }: Props) {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <Suspense fallback={<BlogContent loading size={5} />}>
          <ServerComponent
            api={unstable_cache(
              () => getBlogWithSource(blogHash),
              ['getBlog', blogHash],
              {
                revalidate: 300,
                tags: [`getBlog:${blogHash}`],
              }
            )}
            render={(blog) => (
              <>
                <BlogContent {...blog} />
                <FESEO
                  title={seo.title(blog.title)}
                  description={seo.description(blog.description)}
                  keywords={[
                    ...blog.tags.map((tag) => tag.name),
                    ...blog.tags.map((tag) => tag.description),
                  ].join(',')}
                />
              </>
            )}
            errorBoundary={(err) => <Error {...err} />}
          />
        </Suspense>
        <RecommendSep />
        {/* 推荐列表 */}
        <Suspense fallback={<BlogListLoading count={3} />}>
          <ServerComponent
            api={unstable_cache(
              () => getRecommendBlogs(blogHash),
              ['getRecommendBlogs', blogHash],
              {
                revalidate: 300,
                tags: [`getRecommendBlogs:${blogHash}`],
              }
            )}
            render={(data) => <BlogList blogs={data} />}
            errorBoundary={(err) => <Error {...err} />}
          />
        </Suspense>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
