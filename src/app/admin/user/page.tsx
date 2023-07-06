'use client'

import { UserEditUserList } from './components/UserList'
import { useUserEditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

export default function UserEditor() {
  const {
    data: users,
    elem: UserEditorSearchBar,
    search,
  } = useUserEditorSearchBar()

  return (
    <Box>
      {UserEditorSearchBar}
      <UserEditUserList users={users} onChange={search} />
    </Box>
  )
}
