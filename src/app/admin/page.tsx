'use client'

import { useUser } from '@/user'

import { Box } from '@mui/material'

export default function Home() {
  const user = useUser()
  return (
    <Box>
      欢迎您 {user.name} [{user.role}]
    </Box>
  )
}
