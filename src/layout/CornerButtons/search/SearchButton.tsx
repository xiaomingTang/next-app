import { SearchSection } from './SearchSection'

import { isCtrlAnd, isInputting, useKeyDown } from '@/hooks/useKey'

import { IconButton } from '@mui/material'
import NiceModal from '@ebay/nice-modal-react'
import SearchIcon from '@mui/icons-material/Search'
import { noop } from 'lodash-es'

export function SearchButton() {
  useKeyDown((e) => {
    if (isCtrlAnd('k', e) && !isInputting(e)) {
      e.preventDefault()
      NiceModal.show(SearchSection).catch(noop)
    }
  })
  return (
    <>
      <IconButton
        className='text-primary-main'
        aria-label='搜索博客标题和内容 (快捷键 ctrl + K)'
        title='搜索 [ctrl + K]'
        onClick={() => {
          NiceModal.show(SearchSection).catch(noop)
        }}
      >
        <SearchIcon />
      </IconButton>
    </>
  )
}
