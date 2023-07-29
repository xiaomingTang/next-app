import { Typography } from '@mui/material'
import { green, orange } from '@mui/material/colors'

import type { BlogType } from '@prisma/client'

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
          color: green[800],
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
          color: orange[800],
          fontWeight: 'bold',
        }}
      >
        [未发布]
      </Typography>
    ),
  },
}

export const sortedBlogTypes: BlogType[] = ['PUBLISHED', 'UNPUBLISHED']
