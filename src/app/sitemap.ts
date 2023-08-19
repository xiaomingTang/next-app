import { getBlogs } from './admin/blog/server'
import { getTags } from './admin/tag/server'
import { getMediaCards } from './cards/server'

import { SA } from '@/errors/utils'
import { resolvePath } from '@/utils/url'

import { unstable_cache } from 'next/cache'

import type { MetadataRoute } from 'next'
import type { MediaCardType } from '@prisma/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await unstable_cache(
    () =>
      getBlogs({
        type: 'PUBLISHED',
      }),
    ['getBlogs', 'PUBLISHED'],
    {
      revalidate: 86400,
      tags: ['getBlogs'],
    }
  )().then(SA.decode)

  const blogRoutes = blogs.map((blog) => ({
    url: resolvePath(`/blog/${blog.hash}`).href,
    lastModified: blog.updatedAt,
    priority: 0.8,
  }))

  const tags = await unstable_cache(() => getTags({}), ['getTags'], {
    revalidate: 86400,
    tags: ['getTags'],
  })().then(SA.decode)

  const tagRoutes = tags.map((tag) => ({
    url: resolvePath(`/tag/${tag.hash}`).href,
    lastModified: tag.updatedAt,
    priority: 0.6,
  }))

  const cards = await unstable_cache(
    () => getMediaCards({}),
    ['getMediaCards'],
    {
      revalidate: 86400,
      tags: ['getMediaCards'],
    }
  )().then(SA.decode)

  const getCardsLastModifiedTime = (type: MediaCardType) =>
    Math.max(
      ...cards.filter((c) => c.type === type).map((c) => c.updatedAt.getTime())
    )

  return [
    {
      url: resolvePath('/').href,
      lastModified: new Date(
        Math.max(
          ...blogs.map((b) => b.updatedAt.getTime()),
          ...tags.map((b) => b.updatedAt.getTime())
        )
      ),
      priority: 1,
    },
    ...blogRoutes,
    ...tagRoutes,
    {
      url: resolvePath('/cards/area').href,
      lastModified: new Date(getCardsLastModifiedTime('AREA')),
      priority: 0.4,
    },
    {
      url: resolvePath('/cards/colors').href,
      lastModified: new Date(getCardsLastModifiedTime('COLOR')),
      priority: 0.4,
    },
    {
      url: resolvePath('/cards/foods').href,
      lastModified: new Date(getCardsLastModifiedTime('FOOD')),
      priority: 0.4,
    },
    {
      url: resolvePath('/cards/fruits').href,
      lastModified: new Date(getCardsLastModifiedTime('FRUIT')),
      priority: 0.4,
    },
  ]
}
