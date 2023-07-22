'use client'

import { IconButton, Link } from '@mui/material'
import RssFeedIcon from '@mui/icons-material/RssFeed'
import { orange } from '@mui/material/colors'

export function RssButton() {
  return (
    <IconButton
      aria-label='rss 订阅'
      // use mui Link instead of next Link, to disable prefetch
      LinkComponent={Link}
      href='/rss.xml'
      target='_blank'
      sx={{ color: orange[700] }}
    >
      <RssFeedIcon />
    </IconButton>
  )
}
