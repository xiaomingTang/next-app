import { BlogContent } from '../../components/BlogContent'

import { AlertError } from '@/components/Error'
import { seo } from '@/utils/seo'
import { ServerComponent } from '@/components/ServerComponent'
import { SA } from '@/errors/utils'
import { getBlog } from '@ADMIN/blog/server'

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
      revalidate: 10,
      tags: [`getBlog:${blogHash}`],
    }
  )()

  return seo.defaults({
    title: `草稿: ${blog?.title ?? ''}`,
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

export default async function Index({ params: { blogHash } }: Props) {
  return (
    <Suspense fallback={<BlogContent loading size={8} mode='preview' />}>
      <ServerComponent
        api={() => getBlogWithSource(blogHash)}
        render={(blog) => <BlogContent {...blog} mode='preview' />}
        errorBoundary={(err) => <AlertError {...err} />}
      />
    </Suspense>
  )
}
