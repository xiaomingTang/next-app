'use client'

import { CustomLoadingButton } from './CustomLoadingButton'
import Anchor from './Anchor'

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
        p: 1,
      }}
    >
      {!!user.id && `${user.name} [${RoleNameMap[user.role]}]: `}
      您的权限不足, 您可以
      <CustomLoadingButton
        variant='contained'
        sx={{ mx: 1 }}
        onClick={cat(async () => {
          if (user.id) {
            await useUser.logout()
          }
          await useUser.login().catch(noop)
        })}
      >
        {user.id ? '切换登录' : '登录'}
      </CustomLoadingButton>
      或者<Anchor href='/'>返回首页</Anchor>
    </Box>
  )
}
