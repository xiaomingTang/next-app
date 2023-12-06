import { useLoading } from '@/hooks/useLoading'
import { login } from '@/user/server'
import { SA } from '@/errors/utils'

import { useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useState } from 'react'

import type { LoginType } from './type'

interface EmailLoginProps {
  loginType: LoginType
  setLoginType: React.Dispatch<React.SetStateAction<LoginType>>
}

export function EmailLogin({ setLoginType }: EmailLoginProps) {
  const modal = useModal()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control, setError } = useForm<{
    email: string
    password: string
  }>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(
    withLoading(async (e) => {
      await login(e)
        .then(SA.decode)
        .then((user) => {
          modal.resolve(user)
          modal.hide()
        })
        .catch((err) => {
          setError('password', {
            message: `登录失败: ${err.message}`,
          })
        })
    })
  )

  const emailInput = (
    <Controller
      name='email'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          autoFocus
          label='邮箱'
          helperText={error?.message ?? ' '}
          error={!!error}
        />
      )}
      rules={{
        required: {
          value: true,
          message: '必填项',
        },
        pattern: {
          value: /^\S+@\S+$/i,
          message: '无效邮箱',
        },
      }}
    />
  )

  const passwordInput = (
    <Controller
      name='password'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label='密码'
          type={passwordVisible ? 'text' : 'password'}
          helperText={error?.message ?? ' '}
          error={!!error}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  aria-label='切换密码显隐'
                  onClick={() => setPasswordVisible((prev) => !prev)}
                  edge='end'
                >
                  {passwordVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}
      rules={{
        required: {
          value: true,
          message: '必填项',
        },
        minLength: {
          value: 6,
          message: '最少 6 位',
        },
        maxLength: {
          value: 16,
          message: '最多 16 位',
        },
      }}
    />
  )

  return (
    <Stack component='form' onSubmit={onSubmit}>
      {emailInput}
      {passwordInput}
      <LoadingButton loading={loading} variant='contained' type='submit'>
        登录
      </LoadingButton>
      <Button onClick={() => setLoginType('qrcode')}>切换扫码登录</Button>
    </Stack>
  )
}
