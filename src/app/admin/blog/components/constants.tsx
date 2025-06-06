import Span from '@/components/Span'

import type { BlogType } from '@/generated-prisma-client'

export const BlogTypeMap: Record<
  BlogType,
  {
    name: React.ReactNode
  }
> = {
  PUBLISHED: {
    name: (
      <Span
        sx={{
          color: 'success.main',
          fontWeight: 'bold',
        }}
      >
        [已发布]
      </Span>
    ),
  },
  UNPUBLISHED: {
    name: (
      <Span
        sx={{
          color: 'warning.main',
          fontWeight: 'bold',
        }}
      >
        [未发布]
      </Span>
    ),
  },
}

export const sortedBlogTypes: BlogType[] = ['PUBLISHED', 'UNPUBLISHED']
