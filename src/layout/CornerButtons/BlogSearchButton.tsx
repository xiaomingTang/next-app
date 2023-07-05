'use client'

import { useUser } from '@/user'

import { IconButton } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import { useRouter } from 'next/navigation'

// TODO: 博客搜索
export function BlogSearchButton() {
  const user = useUser()
  const router = useRouter()
  if (!user.id) {
    return <></>
  }
  return (
    <>
      <IconButton
        className='text-primary-main'
        color='inherit'
        aria-label='搜索小说'
        onClick={() => {
          router.push(`/novel/s/d1`)
        }}
      >
        <SearchOutlined />
      </IconButton>
    </>
  )
}
