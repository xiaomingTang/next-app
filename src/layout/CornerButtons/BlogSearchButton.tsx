'use client'

import { BlogSearchSection } from './BlogSearchSection'

import { IconButton } from '@mui/material'
import NiceModal from '@ebay/nice-modal-react'
import SearchIcon from '@mui/icons-material/Search'

// TODO: 博客搜索
export function BlogSearchButton() {
  return (
    <>
      <IconButton
        className='text-primary-main'
        aria-label='搜索博客标题和内容 (仅支持英文搜索)'
        onClick={() => {
          NiceModal.show(BlogSearchSection)
        }}
      >
        <SearchIcon />
      </IconButton>
    </>
  )
}
