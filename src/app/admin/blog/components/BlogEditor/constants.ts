import type { PickAndPartial } from '@/utils/type'
import type { BlogWithTags } from '../../server'

export type PartialBlog = PickAndPartial<
  BlogWithTags,
  'creator' | 'createdAt' | 'updatedAt'
>

export const defaultEmptyBlog: PartialBlog = {
  hash: '',
  title: '',
  content: '',
  description: '',
  type: 'UNPUBLISHED',
  tags: [],
}
