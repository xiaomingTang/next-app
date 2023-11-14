'use client'

import { BlogSearchSection } from './BlogSearchSection'

import { IconButton } from '@mui/material'
import NiceModal from '@ebay/nice-modal-react'
import SearchIcon from '@mui/icons-material/Search'
import { useKeyPressEvent } from 'react-use'

export function BlogSearchButton() {
  useKeyPressEvent(
    (e) => e.ctrlKey && e.key.toLowerCase() === 'f',
    (e) => {
      e.preventDefault()
      NiceModal.show(BlogSearchSection)
    }
  )
  return (
    <>
      <IconButton
        className='text-primary-main'
        aria-label='搜索博客标题和内容 (ctrl + F)'
        title='搜索博客标题和内容 (ctrl + F)'
        onClick={() => {
          NiceModal.show(BlogSearchSection)
        }}
      >
        <SearchIcon />
      </IconButton>
    </>
  )
}
