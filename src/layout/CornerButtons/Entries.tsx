import { Button } from '@mui/material'
import Link from 'next/link'

export function HomeEntry() {
  return (
    <Button
      variant='text'
      LinkComponent={Link}
      href='/blog'
      sx={{
        fontWeight: 'bold',
        fontSize: '1em',
        minWidth: 0,
        height: '100%',
        px: 1,
        whiteSpace: 'nowrap',
      }}
    >
      首页
    </Button>
  )
}

export function BlogEntry() {
  return (
    <Button
      variant='text'
      LinkComponent={Link}
      href='/blog'
      sx={{
        fontWeight: 'bold',
        fontSize: '1em',
        minWidth: 0,
        height: '100%',
        px: 1,
        whiteSpace: 'nowrap',
      }}
    >
      博客
    </Button>
  )
}
