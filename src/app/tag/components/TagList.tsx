'use client'

import { Button, Tooltip, Typography } from '@mui/material'
import Link from 'next/link'

import type { TagWithCreator } from '@/app/admin/tag/server'

export function TagList({
  tags,
  activeTagHash,
}: {
  tags: TagWithCreator[]
  activeTagHash?: string
}) {
  return (
    <>
      {tags.map((tag) => (
        <Tooltip key={tag.hash} title={tag.description}>
          <Button
            variant={
              !activeTagHash || tag.hash === activeTagHash
                ? 'contained'
                : 'outlined'
            }
            size='small'
            aria-label={`标签${tag.name}, 共${tag._count.blogs}篇博客`}
            aria-labelledby={`标签${tag.name}, 共${tag._count.blogs}篇博客`}
            LinkComponent={Link}
            href={`/tag/${tag.hash}`}
            sx={{ mr: 2, mb: 2, borderRadius: 99 }}
          >
            {tag.name}
            <Typography
              component='sup'
              sx={{ pl: 1, opacity: 0.8 }}
              aria-hidden
            >
              {tag._count.blogs}
            </Typography>
          </Button>
        </Tooltip>
      ))}
    </>
  )
}
