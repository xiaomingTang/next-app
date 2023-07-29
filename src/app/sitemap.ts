import { getBlogs } from './admin/blog/server'
import { getTags } from './admin/tag/server'

import { SA } from '@/errors/utils'
import { resolvePath } from '@/utils/url'

import { unstable_cache } from 'next/cache'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await unstable_cache(
    () =>
      getBlogs({
        type: 'PUBLISHED',
      }),
    ['getBlogs', 'PUBLISHED'],
    {
      revalidate: 300,
      tags: ['getBlogs'],
    }
  )().then(SA.decode)

  const blogRoutes = blogs.map((blog) => ({
    url: resolvePath(`/blog/${blog.hash}`).href,
    lastModified: blog.updatedAt,
  }))

  const tags = await unstable_cache(() => getTags({}), ['getTags'], {
    revalidate: 300,
    tags: ['getTags'],
  })().then(SA.decode)

  const tagRoutes = tags.map((tag) => ({
    url: resolvePath(`/tag/${tag.hash}`).href,
    lastModified: tag.updatedAt,
  }))

  const otherRoutes = ['/'].map((route) => ({
    url: resolvePath(route).href,
    lastModified: new Date().toISOString(),
  }))

  return [...blogRoutes, ...tagRoutes, ...otherRoutes]
}
