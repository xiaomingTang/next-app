import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import SellIcon from '@mui/icons-material/Sell'

import type { LoadingAble } from '@/components/ServerComponent'
import type { Tag } from '@prisma/client'

type TagDescProps = LoadingAble<Tag>

export function TagDesc(tag: TagDescProps) {
  return (
    <Typography sx={{ pb: 2 }}>
      <Typography
        component='b'
        sx={{ fontWeight: 'bold', color: 'primary.main' }}
      >
        <SellIcon fontSize='inherit' />{' '}
        {tag.loading ? (
          <Skeleton
            width={tag.size * 16 * 3}
            height={24}
            sx={{ display: 'inline-block' }}
          />
        ) : (
          tag.name
        )}
      </Typography>
      {!tag.loading && <>: {tag.description}</>}
    </Typography>
  )
}
