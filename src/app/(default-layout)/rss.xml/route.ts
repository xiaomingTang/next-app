import { SA } from '@/errors/utils'
import { seo } from '@/utils/seo'
import { resolvePath } from '@/utils/url'
import { getTags } from '@ADMIN/tag/server'
import { prisma } from '@/request/prisma'

import showdown from 'showdown'
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'
import RSS from 'rss'

const blogSelect = {
  hash: true,
  type: true,
  createdAt: true,
  updatedAt: true,
  title: true,
  content: true,
  description: true,
  tags: {
    select: {
      hash: true,
      name: true,
      description: true,
    },
  },
}

export async function GET() {
  console.log('--- rss.xms ---')
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

  // getBlogs 方法需要 admin 权限, 所以这里直接 prisma 取了
  const allBlogs = await prisma.blog.findMany({
    where: { type: 'PUBLISHED' },
    select: blogSelect,
    orderBy: [
      {
        creatorId: 'desc',
      },
      {
        updatedAt: 'desc',
      },
    ],
  })

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
