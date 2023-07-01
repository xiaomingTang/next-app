'use client'

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
          fontSize: 'inherit',
          color: green[800],
          fontWeight: 'bold',
        }}
      >
        <LockIcon
          sx={{
            fontSize: 'inherit',
          }}
        />{' '}
        [私有 - 已发布]
      </Typography>
    ),
  },
  [BlogType.PRIVATE_UNPUBLISHED]: {
    name: (
      <Typography
        component='span'
        sx={{
          fontSize: 'inherit',
          color: orange[800],
          fontWeight: 'bold',
        }}
      >
        <LockIcon
          sx={{
            fontSize: 'inherit',
          }}
        />{' '}
        [私有 - 未发布]
      </Typography>
    ),
  },
  [BlogType.PUBLIC_PUBLISHED]: {
    name: (
      <Typography
        component='span'
        sx={{
          fontSize: 'inherit',
          color: green[800],
          fontWeight: 'bold',
        }}
      >
        <PublicIcon
          sx={{
            fontSize: 'inherit',
          }}
        />{' '}
        [公开 - 已发布]
      </Typography>
    ),
  },
  [BlogType.PUBLIC_UNPUBLISHED]: {
    name: (
      <Typography
        component='span'
        sx={{
          fontSize: 'inherit',
          color: orange[800],
          fontWeight: 'bold',
        }}
      >
        <PublicIcon
          sx={{
            fontSize: 'inherit',
          }}
        />{' '}
        [公开 - 未发布]
      </Typography>
    ),
  },
}
