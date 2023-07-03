'use client'

import { RoleNameMap } from '@/constants'
import { useUser } from '@/user'

import { Box } from '@mui/material'

export default function Home() {
  const user = useUser()
  return (
    <Box>
      欢迎您 [{RoleNameMap[user.role]}]{user.name}
    </Box>
  )
}
