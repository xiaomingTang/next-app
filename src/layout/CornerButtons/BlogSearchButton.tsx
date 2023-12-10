import { BlogSearchSection } from './BlogSearchSection'

import { IconButton } from '@mui/material'
import NiceModal from '@ebay/nice-modal-react'
import SearchIcon from '@mui/icons-material/Search'
import { useKeyPressEvent } from 'react-use'

export function BlogSearchButton() {
  useKeyPressEvent(
    (e) => e.ctrlKey && e.key.toLowerCase() === 'k',
    (e) => {
      e.preventDefault()
      NiceModal.show(BlogSearchSection)
    }
  )
  return (
    <>
      <IconButton
        className='text-primary-main'
        aria-label='搜索博客标题和内容 (快捷键 ctrl + K)'
        title='搜索博客标题和内容 (快捷键 ctrl + K)'
        onClick={() => {
          NiceModal.show(BlogSearchSection)
        }}
      >
        <SearchIcon />
      </IconButton>
    </>
  )
}
