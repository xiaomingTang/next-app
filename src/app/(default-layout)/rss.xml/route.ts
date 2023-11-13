import { getBlogs } from '../admin/blog/server'
import { getTags } from '../admin/tag/server'

import { SA } from '@/errors/utils'
import { seo } from '@/utils/seo'
import { resolvePath } from '@/utils/url'

import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'
import RSS from 'rss'

export async function GET() {
  // 跳过 build 阶段
  if (process.env.npm_lifecycle_event === 'build') {
    // 啥也不干, 只是为了避免 sitemap 变成纯静态文件
    headers()
    const feed = new RSS(
      {
        title: seo.title(),
        description: seo.description(),
        feed_url: resolvePath('/rss.xml').href,
        site_url: resolvePath('/').href,
        language: 'zh-CN',
        copyright: `All rights reserved ${new Date().getFullYear()}`,
        categories: [],
        ttl: 60,
      },
      []
    )

    return new Response(feed.xml())
  }
  const allBlogs = await unstable_cache(
    () =>
      getBlogs({
        type: 'PUBLISHED',
      }),
    ['getBlogs', 'PUBLISHED'],
    {
      revalidate: 3600,
      tags: ['getBlogs'],
    }
  )().then(SA.decode)

  const allTags = await unstable_cache(() => getTags({}), ['getTags'], {
    revalidate: 3600,
    tags: ['getTags'],
  })().then(SA.decode)

  const feed = new RSS(
    {
      title: seo.title(),
      description: seo.description(),
      feed_url: resolvePath('/rss.xml').href,
      site_url: resolvePath('/').href,
      language: 'zh-CN',
      copyright: `All rights reserved ${new Date().getFullYear()}`,
      categories: allTags.map((tag) => tag.name),
      ttl: 60,
    },
    allBlogs.map((blog) => ({
      title: blog.title,
      description: blog.description,
      date: blog.updatedAt,
      url: resolvePath(`/blog/${blog.hash}`).href,
      categories: blog.tags.map((tag) => tag.name),
      custom_elements: [],
    }))
  )

  return new Response(feed.xml())
}
