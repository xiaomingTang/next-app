'use client'

import { saveShortUrl } from './server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { CloseOutlined } from '@mui/icons-material'

import type { ShortUrlWithCreator } from './server'
import type { ShortUrl } from '@prisma/client'
import type { PickAndPartial } from '@/utils/type'

interface EditUrlModalProps {
  shortUrl: PartialShortUrl
  onSuccess?: (shortUrl: ShortUrlWithCreator) => void
  onCancel?: () => void
}

type PartialShortUrl = PickAndPartial<
  ShortUrl,
  'createdAt' | 'creatorId' | 'updatedAt'
>

const defaultEmptyShortUrl: PartialShortUrl = {
  hash: '',
  url: '',
}

const EditUrlModal = NiceModal.create(
  ({ onSuccess, onCancel, shortUrl }: EditUrlModalProps) => {
    const modal = useModal()
    const { loading, withLoading } = useLoading()
    const { handleSubmit, control, setError } = useForm<
      Pick<ShortUrl, 'hash' | 'url'>
    >({
      defaultValues: shortUrl,
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
              {shortUrl.hash ? '编辑短链' : '新建短链'}
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
                await saveShortUrl(e)
                  .then(SA.decode)
                  .then((u) => {
                    onSuccess?.(u)
                    modal.hide()
                  })
                  .catch((err) => {
                    setError('url', {
                      message: err.message,
                    })
                  })
              })
            )}
          >
            <Controller
              name='hash'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  disabled
                  size='small'
                  label='hash'
                  helperText={error?.message ?? ' '}
                  error={!!error}
                />
              )}
            />
            <Controller
              name='url'
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  size='small'
                  label='url'
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
                  value: /^(http|ws)s?:\/\/.+\..+$/,
                  message: '无效 url',
                },
              }}
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
 * @param shortUrl 为空则为新建
 */
export function editShortUrl(
  shortUrl = defaultEmptyShortUrl
): Promise<ShortUrl> {
  return new Promise((resolve, reject) => {
    NiceModal.show(EditUrlModal, {
      shortUrl,
      onSuccess(u) {
        resolve(u)
      },
      onCancel() {
        reject(new Error('操作已取消'))
      },
    })
  })
}
