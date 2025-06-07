import { Link } from '@/components/CustomLink'
import Span from '@/components/Span'

import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type { SxProps, Theme } from '@mui/material'
import type { LoadingAble } from '@/components/ServerComponent'
import type { TagWithCreator } from '@ADMIN/tag/server'

type TagItemProps = LoadingAble<
  Pick<TagWithCreator, 'name' | 'hash' | 'description'>
> &
  Pick<Partial<TagWithCreator>, '_count'> & {
    active?: boolean
    tooltip?: boolean
    /**
     * @default 'medium'
     */
    tagSize?: 'small' | 'medium' | 'large'
    sx?: SxProps<Theme>
  }

const SizeMap = {
  small: 0.75,
  medium: 0.8,
  large: 0.85,
}

export function TagItem(tag: TagItemProps) {
  const ariaLabel = tag._count
    ? `标签${tag.name}, 共${tag._count.blogs}篇博客`
    : `标签${tag.name}`

  const REM = SizeMap[tag.tagSize ?? 'small']

  const elem = (
    <Button
      variant={tag.active ? 'contained' : 'outlined'}
      size='small'
      disabled={tag.loading}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel}
      LinkComponent={Link}
      href={`/tag/${tag.hash}`}
      sx={{
        borderRadius: 1,
        fontSize: `${REM}rem`,
        minWidth: 'unset',
        ...tag.sx,
      }}
      role={tag.loading ? 'none' : undefined}
    >
      <Span>
        {tag.loading ? (
          <Skeleton width={tag.size * REM * 16} height={REM * 24} />
        ) : (
          tag.name
        )}
      </Span>
      {tag._count && (
        <Typography
          component='sup'
          sx={{ fontSize: '0.85em', pl: '2px', opacity: 0.8 }}
          aria-hidden
        >
          {tag._count.blogs}
        </Typography>
      )}
    </Button>
  )

  return tag.tooltip ? <Tooltip title={tag.description}>{elem}</Tooltip> : elem
}
