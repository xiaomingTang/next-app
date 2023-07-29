'use client'

import { saveUser } from '../server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'
import { RoleNameMap } from '@/constants'
import { ENV_CONFIG } from '@/config'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  AppBar,
  Box,
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
import CloseIcon from '@mui/icons-material/Close'
import CopyToClipboard from 'react-copy-to-clipboard'
import { toast } from 'react-hot-toast'

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
  role: 'USER',
}

const UserTip = NiceModal.create(({ user }: { user: User }) => {
  const modal = useModal()
  const texts = [
    `网站: ${ENV_CONFIG.public.origin}`,
    `用户名: ${user.name} (用户名仅作为标识, 请使用邮箱登录)`,
    `角色: ${RoleNameMap[user.role]}`,
    `--- 以下为登录凭证 ---`,
    `--- 忘记密码可联系管理员重置 ---`,
    `邮箱: ${user.email}`,
    `密码: ${user.password}`,
  ]
  return (
    <Dialog {...muiDialogV5(modal)} fullWidth maxWidth='xs'>
      <AppBar position='relative' sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            新建用户信息展示
          </Typography>
          <IconButton
            edge='end'
            onClick={() => {
              modal.hide()
            }}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Alert severity='warning'>
        请记住你的用户名和密码, 仅会展示这一次, 且不可找回 (以下内容可点击复制)
      </Alert>
      <DialogContent>
        <CopyToClipboard
          text={texts.join('\n')}
          onCopy={() => toast.success('复制成功')}
        >
          <Box sx={{ cursor: 'copy' }}>
            {texts.map((t) => (
              <Typography key={t}>{t}</Typography>
            ))}
          </Box>
        </CopyToClipboard>
      </DialogContent>
    </Dialog>
  )
})

const EditUserModal = NiceModal.create(
  ({ onSuccess, onCancel, user }: EditUserModalProps) => {
    const modal = useModal()
    const [loading, withLoading] = useLoading()
    const { handleSubmit, control, setError } = useForm<PartialUser>({
      defaultValues: user,
    })

    return (
      <Dialog
        {...muiDialogV5(modal)}
        fullWidth
        maxWidth='xs'
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
              onClick={() => {
                onCancel?.()
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
                await saveUser(e)
                  .then(SA.decode)
                  .then((u) => {
                    if (!user.id) {
                      // 创建用户时, 提示用户名及密码
                      NiceModal.show(UserTip, {
                        user: {
                          ...u,
                          ...e,
                        },
                      })
                    }
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
                    <MenuItem key={'ADMIN'} value={'ADMIN'}>
                      {RoleNameMap.ADMIN}
                    </MenuItem>
                    <MenuItem key={'USER'} value={'USER'}>
                      {RoleNameMap.USER}
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
