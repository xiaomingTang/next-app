'use client'

import { cat } from '@/errors/catchAndToast'
import { useLoading } from '@/hooks/useLoading'
import { useUser } from '@/user'

import { LoadingButton } from '@mui/lab'
import { Box } from '@mui/material'
import { noop } from 'lodash-es'

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
          onClick={withLoading(
            cat(async () => {
              await useUser.logout()
              await useUser.login().catch(noop)
            })
          )}
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
