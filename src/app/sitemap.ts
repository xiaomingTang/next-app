import { getBlogs } from './admin/blog/components/server'
import { getTags } from './admin/tag/components/server'

import { SA } from '@/errors/utils'
import { resolvePath } from '@/utils/url'

import { BlogType } from '@prisma/client'

import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogs({
    type: BlogType.PUBLISHED,
  }).then(SA.decode)

  const blogRoutes = blogs.map((blog) => ({
    url: resolvePath(`/blog/${blog.hash}`).href,
    lastModified: blog.updatedAt,
  }))

  const tags = await getTags({}).then(SA.decode)

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
