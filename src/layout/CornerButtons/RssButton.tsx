'use client'

import { Link } from '@/components/CustomLink'

import { IconButton } from '@mui/material'
import RssFeedIcon from '@mui/icons-material/RssFeed'
import { orange } from '@mui/material/colors'

export function RssButton() {
  return (
    <IconButton
      aria-label='rss 订阅'
      LinkComponent={Link}
      href='/rss.xml'
      target='_blank'
      sx={{ color: orange[700] }}
    >
      <RssFeedIcon />
    </IconButton>
  )
}
