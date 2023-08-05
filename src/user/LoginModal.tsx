'use client'

import { useLoading } from '@/hooks/useLoading'
import { login } from '@/user/server'
import { SA } from '@/errors/utils'
import { useInjectHistory } from '@/hooks/useInjectHistory'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useState } from 'react'

export const LoginModal = NiceModal.create(() => {
  const modal = useModal()
  useInjectHistory(modal, async () => {
    modal.reject(new Error('操作已取消'))
    modal.hide()
  })
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

  return (
    <Dialog
      {...muiDialogV5(modal)}
      fullWidth
      maxWidth='xs'
      onClose={(e, reason) => {
        // disable backdrop close
        if (reason === 'backdropClick') {
          return
        }
        modal.reject(new Error('操作已取消'))
        modal.hide()
      }}
    >
      <AppBar position='relative' sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            登录
          </Typography>
          <IconButton
            edge='end'
            onClick={() => {
              modal.reject(new Error('操作已取消'))
              modal.hide()
            }}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <form
          className='flex flex-col gap-2 pt-2'
          onSubmit={handleSubmit(
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
          )}
        >
          <Controller
            name='email'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
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
          <Controller
            name='password'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
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
                        {passwordVisible ? (
                          <VisibilityIcon />
                        ) : (
                          <VisibilityOffIcon />
                        )}
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
          <LoadingButton loading={loading} variant='contained' type='submit'>
            登录
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  )
})
