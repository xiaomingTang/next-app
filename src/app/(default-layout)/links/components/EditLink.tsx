'use client'

import { FriendsLinkStatusMap, sortedFriendsLinkStatus } from './constants'
import { FriendsLinkResultTip } from './FriendsLinkResultTip'

import { saveFriendsLink } from '../server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { useUser } from '@/user'
import { SilentError } from '@/errors/SilentError'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'
import { cat } from '@/errors/catchAndToast'

import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  AppBar,
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

import type { SimpleFriendsLink } from '../server'

interface EditFriendsLinkModalProps {
  friendsLink: Partial<SimpleFriendsLink>
}

const EditUrlModal = NiceModal.create(
  ({ friendsLink }: EditFriendsLinkModalProps) => {
    const isAdmin = useUser().role === 'ADMIN'
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new SilentError('操作已取消'))
      void modal.hide()
    })
    const [loading, withLoading] = useLoading()
    const { handleSubmit, control } = useForm<
      Partial<SimpleFriendsLink> & {
        url: string
        name: string
        email?: string
      }
    >({
      defaultValues: {
        ...friendsLink,
        status: 'PENDING',
      },
    })

    return (
      <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              {friendsLink.hash ? '编辑友链' : '申请友链'}
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
              withLoading(
                cat(async (rest) => {
                  const savedLink = await saveFriendsLink(rest).then(SA.decode)
                  if (savedLink.status !== 'PENDING' && savedLink.email) {
                    await NiceModal.show(FriendsLinkResultTip, {
                      link: savedLink,
                    }).catch(noop)
                  }
                  modal.resolve(savedLink)
                  void modal.hide()
                })
              )
            )}
          >
            <Controller
              name='name'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  autoFocus
                  label='站点名称'
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
              rules={{
                required: {
                  value: true,
                  message: '必填项',
                },
                maxLength: {
                  value: 100,
                  message: '最多 100 个字符',
                },
              }}
            />
            <Controller
              name='url'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label='站点 url (必须 https)'
                  placeholder='https://xxx.xxx'
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
              rules={{
                required: {
                  value: true,
                  message: '必填项',
                },
                maxLength: {
                  value: 200,
                  message: '最多 200 个字符',
                },
                pattern: {
                  value: /^https:\/\/.+\..+$/,
                  message: '无效 url',
                },
              }}
            />
            <Controller
              name='email'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label='邮箱 (可选)'
                  placeholder='审核结果会在三天内通知该邮箱'
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
              rules={{
                maxLength: {
                  value: 200,
                  message: '最多 200 个字符',
                },
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: '无效邮箱',
                },
              }}
            />
            <Controller
              name='description'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label='站点一句话描述 (可选)'
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
              rules={{
                maxLength: {
                  value: 200,
                  message: '最多 200 个字符',
                },
              }}
            />
            <Controller
              name='image'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label='站点 logo (可选)'
                  placeholder='图片地址如: https://xxx.xxx'
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
              rules={{
                maxLength: {
                  value: 400,
                  message: '最多 400 个字符',
                },
                pattern: {
                  value: /^https:\/\/.+\..+$/,
                  message: '无效 url',
                },
              }}
            />
            <Controller
              name='status'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormControl
                  disabled={!isAdmin}
                  error={!!error}
                  sx={{ minWidth: 200, maxWidth: 500 }}
                >
                  <InputLabel>审核状态</InputLabel>
                  <Select
                    {...field}
                    input={<OutlinedInput label='审核状态' />}
                    renderValue={(type) => (
                      <>{FriendsLinkStatusMap[type].name}</>
                    )}
                  >
                    {sortedFriendsLinkStatus.map((type) => (
                      <MenuItem key={type} value={type}>
                        {FriendsLinkStatusMap[type].name}
                      </MenuItem>
                    ))}
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
  }
)

/**
 * @param friendsLink 为空则为新建
 */
export function editFriendsLink(friendsLink = {}): Promise<SimpleFriendsLink> {
  return NiceModal.show(EditUrlModal, {
    friendsLink,
  })
}
