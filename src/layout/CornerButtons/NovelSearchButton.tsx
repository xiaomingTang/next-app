'use client'

import { useUser } from '@/user'

import { IconButton } from '@mui/material'
import { SearchOutlined } from '@mui/icons-material'
import router from 'next/router'

export function NovelSearchButton() {
  const user = useUser()
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
