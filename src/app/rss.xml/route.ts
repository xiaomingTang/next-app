import { getBlogs } from '../admin/blog/components/server'
import { getTags } from '../admin/tag/components/server'

import { SA } from '@/errors/utils'
import { seo } from '@/utils/seo'
import { resolvePath } from '@/utils/url'

import { BlogType } from '@prisma/client'
import RSS from 'rss'

export async function GET() {
  const allBlogs = await getBlogs({
    type: BlogType.PUBLISHED,
  }).then(SA.decode)

  const allTags = await getTags({}).then(SA.decode)

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