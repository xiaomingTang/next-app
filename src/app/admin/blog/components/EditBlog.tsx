'use client'

import NiceModal from '@ebay/nice-modal-react'

import type { PartialBlog } from './BlogEditor/constants'
import type { BlogWithTags } from '../server'

export async function editBlog(input: PartialBlog): Promise<BlogWithTags> {
  const BlogEditor = await import('./BlogEditor').then((m) => m.BlogEditor)
  return NiceModal.show(BlogEditor, {
    blog: input,
  })
}
