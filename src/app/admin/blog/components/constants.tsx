import LockIcon from '@mui/icons-material/Lock'
import PublicIcon from '@mui/icons-material/Public'
import { BlogType } from '@prisma/client'
import { Typography } from '@mui/material'
import { green, orange } from '@mui/material/colors'

export const BlogTypeMap: Record<
  BlogType,
  {
    name: React.ReactElement
  }
> = {
  [BlogType.PRIVATE_PUBLISHED]: {
    name: (
      <Typography
        component='span'
        sx={{
          color: green[800],
          fontWeight: 'bold',
        }}
      >
        <LockIcon fontSize='small' /> [私有 - 已发布]
      </Typography>
    ),
  },
  [BlogType.PRIVATE_UNPUBLISHED]: {
    name: (
      <Typography
        component='span'
        sx={{
          color: orange[800],
          fontWeight: 'bold',
        }}
      >
        <LockIcon fontSize='small' /> [私有 - 未发布]
      </Typography>
    ),
  },
  [BlogType.PUBLIC_PUBLISHED]: {
    name: (
      <Typography
        component='span'
        sx={{
          color: green[800],
          fontWeight: 'bold',
        }}
      >
        <PublicIcon fontSize='small' /> [公开 - 已发布]
      </Typography>
    ),
  },
  [BlogType.PUBLIC_UNPUBLISHED]: {
    name: (
      <Typography
        component='span'
        sx={{
          color: orange[800],
          fontWeight: 'bold',
        }}
      >
        <PublicIcon fontSize='small' /> [公开 - 未发布]
      </Typography>
    ),
  },
}

export const sortedBlogTypes: BlogType[] = [
  BlogType.PUBLIC_PUBLISHED,
  BlogType.PUBLIC_UNPUBLISHED,
  BlogType.PRIVATE_PUBLISHED,
  BlogType.PRIVATE_UNPUBLISHED,
]
