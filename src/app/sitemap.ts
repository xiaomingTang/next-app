import { getMediaCards } from '@D/cards/server'
import { SA } from '@/errors/utils'
import { resolvePath } from '@/utils/url'

import { getTags } from '@ADMIN/tag/server'
import { getBlogs } from '@ADMIN/blog/server'
import { headers } from 'next/headers'
import { unstable_cache } from 'next/cache'

import type { MetadataRoute } from 'next'
import type { MediaCardType } from '@prisma/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 跳过 build 阶段
  if (process.env.npm_lifecycle_event === 'build') {
    // 不能删, 啥也不干, 但是能避免 sitemap 变成纯静态文件
    console.log(headers().get('User-Agent'))
    return []
  }
  const blogs = await unstable_cache(
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

  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: resolvePath(`/blog/${blog.hash}`).href,
    // 拿到的是 string...
    lastModified: blog.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const tags = await unstable_cache(() => getTags({}), ['getTags'], {
    revalidate: 3600,
    tags: ['getTags'],
  })().then(SA.decode)

  const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: resolvePath(`/tag/${tag.hash}`).href,
    // 拿到的是 string...
    lastModified: tag.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const cards = await unstable_cache(
    () => getMediaCards({}),
    ['getMediaCards'],
    {
      revalidate: 3600,
      tags: ['getMediaCards'],
    }
  )().then(SA.decode)

  const getCardsLastModifiedTime = (type: MediaCardType) =>
    Math.max(
      ...cards
        .filter((c) => c.type === type)
        .map((c) => new Date(c.updatedAt).getTime())
    )

  return [
    {
      url: resolvePath('/').href,
      lastModified: new Date(
        Math.max(
          ...blogs.map((b) => new Date(b.updatedAt).getTime()),
          ...tags.map((b) => new Date(b.updatedAt).getTime())
        )
      ),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...blogRoutes,
    ...tagRoutes,
    {
      url: resolvePath('/wallpaper').href,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: resolvePath('/cards/area').href,
      lastModified: new Date(getCardsLastModifiedTime('AREA')),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: resolvePath('/cards/colors').href,
      lastModified: new Date(getCardsLastModifiedTime('COLOR')),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: resolvePath('/cards/foods').href,
      lastModified: new Date(getCardsLastModifiedTime('FOOD')),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: resolvePath('/cards/fruits').href,
      lastModified: new Date(getCardsLastModifiedTime('FRUIT')),
      changeFrequency: 'monthly',
      priority: 0.2,
    },
    {
      url: resolvePath('/qrcode/generate').href,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: resolvePath('/qrcode/scan').href,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]
}
