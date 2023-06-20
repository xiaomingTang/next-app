'use client'

import { useLoading } from '@/hooks/useLoading'
import { useUser } from '@/user'

import { LoadingButton } from '@mui/lab'
import { Box } from '@mui/material'
import { noop } from 'lodash-es'
import { toast } from 'react-hot-toast'

export function Forbidden() {
  const user = useUser()
  const { loading, withLoading } = useLoading()
  return (
    <Box
      sx={{
        padding: '0.5em',
      }}
    >
      {!!user.id && `${user.name} [${user.role}]: `}
      您的权限不足, 您可以
      {user.id ? (
        <LoadingButton
          loading={loading}
          variant='contained'
          size='small'
          sx={{ marginLeft: '0.5em' }}
          onClick={withLoading(async () => {
            await useUser.logout().catch((err) => toast.error(err.message))
            await useUser.login().catch(noop)
          })}
        >
          切换登录
        </LoadingButton>
      ) : (
        <LoadingButton
          loading={loading}
          variant='contained'
          size='small'
          sx={{ marginLeft: '0.5em' }}
          onClick={withLoading(async () => {
            await useUser.login().catch(noop)
          })}
        >
          登录
        </LoadingButton>
      )}
    </Box>
  )
}
