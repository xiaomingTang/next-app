import { BlogContent } from '../components/BlogContent'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlog } from '@/app/admin/blog/components/server'
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
  const { data: blog, error } = await getBlog({
    hash: blogHash,
  })
  const source = await serialize(blog?.content ?? '', {
    mdxOptions: {
      rehypePlugins: [rehypeHighlight],
      remarkPlugins: [remarkGfm],
      format: 'md',
    },
  })

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        {blog ? (
          <BlogContent {...blog} source={source} />
        ) : (
          <Error {...error} />
        )}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
