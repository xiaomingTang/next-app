import { BlogType } from '@prisma/client'
import { Typography } from '@mui/material'
import { green, orange } from '@mui/material/colors'

export const BlogTypeMap: Record<
  BlogType,
  {
    name: React.ReactNode
  }
> = {
  [BlogType.PUBLISHED]: {
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
  [BlogType.UNPUBLISHED]: {
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

export const sortedBlogTypes: BlogType[] = [
  BlogType.PUBLISHED,
  BlogType.UNPUBLISHED,
]
