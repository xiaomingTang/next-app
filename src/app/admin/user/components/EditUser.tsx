'use client'

import { saveUser } from './server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  AppBar,
  Dialog,
  DialogContent,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { CloseOutlined } from '@mui/icons-material'
import { Role } from '@prisma/client'

import type { PickAndPartial } from '@/utils/type'
import type { User } from '@prisma/client'

type PartialUser = PickAndPartial<User, 'id'>

interface EditUserModalProps {
  user: PartialUser
  onSuccess?: (user: User) => void
  onCancel?: () => void
}

const defaultEmptyUser: PartialUser = {
  name: '',
  email: '',
  password: '',
  role: Role.USER,
}

const EditUserModal = NiceModal.create(
  ({ onSuccess, onCancel, user }: EditUserModalProps) => {
    const modal = useModal()
    const { loading, withLoading } = useLoading()
    const { handleSubmit, control, setError } = useForm<PartialUser>({
      defaultValues: user,
    })

    return (
      <Dialog
        {...muiDialogV5(modal)}
        onClose={() => {
          onCancel?.()
          modal.hide()
        }}
      >
        <AppBar position='relative' sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              {user.id ? '编辑用户' : '新建用户'}
            </Typography>
            <IconButton
              edge='end'
              color='inherit'
              onClick={() => {
                onCancel?.()
                modal.hide()
              }}
              aria-label='close'
            >
              <CloseOutlined />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <form
            className='flex flex-col gap-2 pt-2'
            onSubmit={handleSubmit(
              withLoading(async (e) => {
                await saveUser(e)
                  .then(SA.decode)
                  .then((u) => {
                    onSuccess?.(u)
                    modal.hide()
                  })
                  .catch((err) => {
                    setError('email', {
                      message: err.message,
                    })
                  })
              })
            )}
          >
            <Controller
              name='name'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  size='small'
                  label='用户名'
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
              rules={{
                required: {
                  value: true,
                  message: '必填项',
                },
                minLength: {
                  value: 3,
                  message: '3 - 24 位',
                },
                maxLength: {
                  value: 24,
                  message: '3 - 24 位',
                },
              }}
            />
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
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
              rules={{
                required: {
                  // 无 id 时, 为创建用户, 密码必填
                  value: !user.id,
                  message: '必填项',
                },
                minLength: {
                  value: 6,
                  message: '6 - 16 位',
                },
                maxLength: {
                  value: 16,
                  message: '6 - 16 位',
                },
              }}
            />
            <Controller
              name='role'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl size='small'>
                  <InputLabel>角色</InputLabel>
                  <Select
                    {...field}
                    error={!!error}
                    input={<OutlinedInput label='role' />}
                  >
                    <MenuItem key={Role.ADMIN} value={Role.ADMIN}>
                      管理员
                    </MenuItem>
                    <MenuItem key={Role.USER} value={Role.USER}>
                      普通用户
                    </MenuItem>
                  </Select>
                  <FormHelperText>{error?.message ?? ' '}</FormHelperText>
                </FormControl>
              )}
            />
            <LoadingButton loading={loading} variant='contained' type='submit'>
              提交
            </LoadingButton>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

/**
 * @param user 为空则为新建
 */
export function editUser(user = defaultEmptyUser): Promise<User> {
  return new Promise((resolve, reject) => {
    NiceModal.show(EditUserModal, {
      user,
      onSuccess(u) {
        resolve(u)
      },
      onCancel() {
        reject(new Error('操作已取消'))
      },
    })
  })
}
