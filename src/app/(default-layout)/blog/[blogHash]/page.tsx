import { BlogPage } from '../components/BlogPage'
import { BlogList, BlogListLoading } from '../components/BlogList'
import { RecommendSep } from '../components/RecommendSep'
import { Toc } from '../components/Toc'

import { AlertError } from '@/components/Error'
import { seo } from '@/utils/seo'
import { ServerComponent } from '@/components/ServerComponent'
import { SA } from '@/errors/utils'
import { FESEO } from '@/components/FESEO'
import { DefaultAside } from '@/layout/DefaultAside'
import { Delay } from '@/components/Delay'
import { getBlog, getRecommendBlogs } from '@ADMIN/blog/server'
import { resolvePath } from '@/utils/url'
import { ABOUT_PAGE_BLOG_HASH } from '@D/about/constants'

import { unstable_cache } from 'next/cache'
import { Suspense } from 'react'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import { serialize } from 'next-mdx-remote/serialize'

import type { Metadata } from 'next'

interface Params {
  blogHash: string
}

interface Props {
  params: Promise<Params>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  const { blogHash } = params

  const canonicalPath =
    blogHash.toLowerCase() === ABOUT_PAGE_BLOG_HASH.toLowerCase()
      ? '/about'
      : `/blog/${blogHash}`

  // 由于可能涉及到未发布博客，因此不能缓存
  const { data: blog, error } = await getBlog({
    hash: blogHash,
  })

  if (!blog) {
    return seo.defaults({
      title: error.message,
    })
  }

  return seo.defaults({
    title: blog.title,
    description: blog.description,
    keywords: [
      ...(blog.tags.map((tag) => tag.name) ?? []),
      ...(blog.tags.map((tag) => tag.description) ?? []),
    ].join(','),
    alternates: {
      // 不能使用 URL, 貌似会导致 canonical 路径不正确，
      // 可能是被其他的 [blogHash] 路径覆盖了
      canonical: resolvePath(canonicalPath).href,
    },
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
        format: 'mdx',
      },
    }),
  }
})

export default async function Index(props: Props) {
  const params = await props.params

  const { blogHash } = params

  return (
    <>
      <Suspense fallback={<BlogPage loading size={4} />}>
        <ServerComponent
          // 由于可能涉及到未发布博客，因此不能缓存
          api={() => getBlogWithSource(blogHash)}
          render={(blog) => (
            <>
              <DefaultAside placement='right'>
                <Delay>
                  <Toc mt={1} />
                </Delay>
              </DefaultAside>
              <BlogPage {...blog} />
              <FESEO
                title={blog.title}
                description={blog.description}
                keywords={[
                  ...blog.tags.map((tag) => tag.name),
                  ...blog.tags.map((tag) => tag.description),
                ].join(',')}
              />
            </>
          )}
          errorBoundary={(err) => <AlertError {...err} />}
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
              revalidate: 10,
              tags: [`getRecommendBlogs:${blogHash}`],
            }
          )}
          render={(data) => <BlogList blogs={data} />}
          errorBoundary={(err) => <AlertError {...err} />}
        />
      </Suspense>
    </>
  )
}
