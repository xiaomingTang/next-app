import { SA } from '@/errors/utils'
import { seo } from '@/utils/seo'
import { resolvePath } from '@/utils/url'
import { getTags } from '@ADMIN/tag/server'
import { privateGetBlogs } from '@/app/admin/blog/server'

import showdown from 'showdown'
import { unstable_cache, unstable_noStore as noStore } from 'next/cache'
import RSS from 'rss'

export async function GET() {
  noStore()
  console.log('--- rss.xml ---')

  const allBlogs = await privateGetBlogs({
    type: 'PUBLISHED',
  }).then(SA.decode)

  const converter = new showdown.Converter()

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
      description: converter.makeHtml(blog.content),
      date: blog.updatedAt,
      url: resolvePath(`/blog/${blog.hash}`).href,
      categories: blog.tags.map((tag) => tag.name),
      custom_elements: [],
    }))
  )

  return new Response(feed.xml())
}
