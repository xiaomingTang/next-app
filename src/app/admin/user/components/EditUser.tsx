'use client'

import { saveUser } from '../server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'
import { RoleNameMap } from '@/constants'
import { ENV_CONFIG } from '@/config'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'
import { copyToClipboard } from '@/utils/copyToClipboard'

import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  AppBar,
  Box,
  Button,
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
import CloseIcon from '@mui/icons-material/Close'
import { noop } from 'lodash-es'

import type { PickAndPartial } from '@/utils/type'
import type { User } from '@/generated-prisma-client'

type PartialUser = PickAndPartial<User, 'id'>

interface EditUserModalProps {
  user: PartialUser
}

const defaultEmptyUser: PartialUser = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
}

const UserTip = NiceModal.create(({ user }: { user: User }) => {
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new SilentError('操作已取消'))
    void modal.hide()
  })
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
    <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
      <AppBar sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            新建用户信息展示
          </Typography>
          <IconButton
            edge='end'
            onClick={() => {
              modal.resolve()
              void modal.hide()
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
        <Box
          sx={{ cursor: 'copy' }}
          onClick={() => copyToClipboard(texts.join('\n'))}
        >
          {texts.map((t) => (
            <Typography key={t}>{t}</Typography>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  )
})

const EditUserModal = NiceModal.create(({ user }: EditUserModalProps) => {
  const modal = useModal()
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control, setError } = useForm<PartialUser>({
    defaultValues: user,
  })

  return (
    <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
      <AppBar sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            {user.id ? '编辑用户' : '新建用户'}
          </Typography>
          <IconButton
            edge='end'
            onClick={() => {
              modal.reject(new SilentError('操作已取消'))
              void modal.hide()
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
                .then(async (u) => {
                  if (!user.id) {
                    // 创建用户时, 提示用户名及密码
                    await NiceModal.show(UserTip, {
                      user: {
                        ...u,
                        ...e,
                      },
                    }).catch(noop)
                  }
                  modal.resolve(u)
                  void modal.hide()
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
                autoFocus
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
              <FormControl error={!!error}>
                <InputLabel>角色</InputLabel>
                <Select {...field} input={<OutlinedInput label='role' />}>
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
          <Button loading={loading} variant='contained' type='submit'>
            提交
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
})

/**
 * @param user 为空则为新建
 */
export function editUser(user = defaultEmptyUser): Promise<User> {
  return NiceModal.show(EditUserModal, {
    user,
  })
}
