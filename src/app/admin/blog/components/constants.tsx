import { Typography } from '@mui/material'

import type { BlogType } from '@/generated-prisma-client'

export const BlogTypeMap: Record<
  BlogType,
  {
    name: React.ReactNode
  }
> = {
  PUBLISHED: {
    name: (
      <Typography
        component='span'
        sx={{
          color: 'success.main',
          fontWeight: 'bold',
        }}
      >
        [已发布]
      </Typography>
    ),
  },
  UNPUBLISHED: {
    name: (
      <Typography
        component='span'
        sx={{
          color: 'warning.main',
          fontWeight: 'bold',
        }}
      >
        [未发布]
      </Typography>
    ),
  },
}

export const sortedBlogTypes: BlogType[] = ['PUBLISHED', 'UNPUBLISHED']
