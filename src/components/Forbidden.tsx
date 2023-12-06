'use client'

import { CustomLoadingButton } from './CustomLoadingButton'

import { RoleNameMap } from '@/constants'
import { cat } from '@/errors/catchAndToast'
import { useUser } from '@/user'

import { Box } from '@mui/material'
import { noop } from 'lodash-es'

export function Forbidden() {
  const user = useUser()
  return (
    <Box
      sx={{
        padding: '0.5em',
      }}
    >
      {!!user.id && `${user.name} [${RoleNameMap[user.role]}]: `}
      您的权限不足, 您可以
      <CustomLoadingButton
        variant='contained'
        sx={{ marginLeft: '0.5em' }}
        onClick={cat(async () => {
          if (user.id) {
            await useUser.logout()
          }
          await useUser.login().catch(noop)
        })}
      >
        {user.id ? '切换登录' : '登录'}
      </CustomLoadingButton>
    </Box>
  )
}
