import { BlogContent } from '../components/BlogContent'
import { BlogList } from '../components/BlogList'
import { RecommendSep } from '../components/RecommendSep'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlog, getRecommendBlogs } from '@/app/admin/blog/components/server'
import { Error } from '@/components/Error'
import { seo } from '@/utils/seo'

import { serialize } from 'next-mdx-remote/serialize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import type { Metadata } from 'next'

interface Props {
  params: { blogHash: string }
}

export async function generateMetadata({
  params: { blogHash },
}: Props): Promise<Metadata> {
  const { data: blog } = await getBlog({
    hash: blogHash,
  })

  return seo.defaults({
    title: blog?.title,
    keywords: [
      ...(blog?.tags.map((tag) => tag.name) ?? []),
      ...(blog?.tags.map((tag) => tag.description) ?? []),
    ].join(','),
  })
}

export default async function Home({ params: { blogHash } }: Props) {
  const { data: blog, error: fetchBlogError } = await getBlog({
    hash: blogHash,
  })
  const source = await serialize(blog?.content ?? '', {
    mdxOptions: {
      rehypePlugins: [rehypeHighlight],
      remarkPlugins: [remarkGfm],
      format: 'md',
    },
  })
  const { data: recs, error: fetchRecsError } = await getRecommendBlogs(
    blog?.hash ?? ''
  )

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        {blog ? (
          <BlogContent {...blog} source={source} />
        ) : (
          <Error {...fetchBlogError} />
        )}
        <RecommendSep />
        {recs ? <BlogList blogs={recs} /> : <Error {...fetchRecsError} />}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
