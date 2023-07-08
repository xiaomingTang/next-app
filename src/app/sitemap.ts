import { getBlogs } from './admin/blog/components/server'
import { getTags } from './admin/tag/components/server'

import { SA } from '@/errors/utils'
import { ENV_CONFIG } from '@/config'

import { BlogType } from '@prisma/client'

import type { MetadataRoute } from 'next'

function resolve(pathname: string) {
  const url = new URL('/', ENV_CONFIG.public.origin)
  url.pathname = pathname
  return url.href
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogs({
    type: BlogType.PUBLISHED,
  }).then(SA.decode)

  const blogRoutes = blogs.map((blog) => ({
    url: resolve(`/blog/${blog.hash}`),
    lastModified: blog.updatedAt,
  }))

  const tags = await getTags({}).then(SA.decode)

  const tagRoutes = tags.map((tag) => ({
    url: resolve(`/tag/${tag.hash}`),
    lastModified: tag.updatedAt,
  }))

  const otherRoutes = ['/'].map((route) => ({
    url: resolve(route),
    lastModified: new Date().toISOString(),
  }))

  return [...blogRoutes, ...tagRoutes, ...otherRoutes]
}
