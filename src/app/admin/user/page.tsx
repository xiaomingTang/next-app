'use client'

import { UserEditUserList } from './components/UserList'
import { useUserEditorSearchBar } from './components/SearchBar'

import { Box } from '@mui/material'

// markdown editor
// https://stackedit.io/app#origin=https://benweet.github.io&fileName=MarkdownWithStackEdit&contentText=Hello

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
