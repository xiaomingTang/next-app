'use client'

import { saveShortUrl } from '../server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { numberFormat } from '@/utils/numberFormat'
import { SilentError } from '@/errors/SilentError'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'

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
import { omit } from 'lodash-es'

import type { ShortUrl } from '@/generated-prisma-client'
import type { PickAndPartial } from '@/utils/type'

type PartialShortUrl = PickAndPartial<
  ShortUrl,
  'createdAt' | 'creatorId' | 'updatedAt' | 'timeout'
>

interface EditUrlModalProps {
  shortUrl: PartialShortUrl
}

const timeoutSelections = [
  {
    label: '不限期',
    value: 1000 * 60 * 60 * 24 * 365 * 1000,
  },
  {
    label: '10分钟',
    value: 1000 * 60 * 10,
  },
  {
    label: '30分钟',
    value: 1000 * 60 * 30,
  },
  {
    label: '1小时',
    value: 1000 * 60 * 60,
  },
  {
    label: '1天',
    value: 1000 * 60 * 60 * 24 * 1,
  },
  {
    label: '3天',
    value: 1000 * 60 * 60 * 24 * 3,
  },
  {
    label: '7天',
    value: 1000 * 60 * 60 * 24 * 7,
  },
]

const defaultEmptyShortUrl: PartialShortUrl = {
  hash: '',
  url: '',
  description: '',
  limit: 1234567890,
  password: '',
}

const EditUrlModal = NiceModal.create(({ shortUrl }: EditUrlModalProps) => {
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new SilentError('操作已取消'))
    void modal.hide()
  })
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control, setError } = useForm<
    Pick<ShortUrl, 'hash' | 'url' | 'description' | 'limit' | 'password'> & {
      timeout: number
    }
  >({
    defaultValues: {
      ...omit(shortUrl, 'timeout'),
      timeout: timeoutSelections[0].value,
    },
  })

  return (
    <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
      <AppBar sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            {shortUrl.hash ? '编辑短链' : '新建短链'}
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
            withLoading(async ({ timeout, limit, ...rest }) => {
              const convertedData = {
                ...rest,
                timeout: Date.now() + timeout,
                // 艹了, react-hook-form + mui textfield 始终输出不了 number...
                limit: numberFormat(limit),
              }
              await saveShortUrl(convertedData)
                .then(SA.decode)
                .then((u) => {
                  modal.resolve(u)
                  void modal.hide()
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
            name='url'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                autoFocus
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
          <Controller
            name='description'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                autoFocus
                label='描述'
                helperText={error?.message ?? ' '}
                error={!!error}
              />
            )}
            rules={{
              required: {
                value: true,
                message: '必填项',
              },
            }}
          />
          <Controller
            name='timeout'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <FormControl
                error={!!error}
                sx={{ minWidth: 200, maxWidth: 500 }}
              >
                <InputLabel>过期时间</InputLabel>
                <Select
                  {...field}
                  input={<OutlinedInput label='过期时间' />}
                  renderValue={(val) => (
                    <>
                      {timeoutSelections.find((item) => item.value === val)
                        ?.label ?? '选择有误'}
                    </>
                  )}
                >
                  {timeoutSelections.map((selection) => (
                    <MenuItem key={selection.value} value={selection.value}>
                      {selection.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{error?.message ?? ' '}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name='password'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label='访问密码 (可缺省)'
                helperText={error?.message ?? ' '}
                error={!!error}
              />
            )}
          />
          <Controller
            name='limit'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label='可访问次数 (可缺省)'
                type='number'
                helperText={error?.message ?? ' '}
                error={!!error}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  },
                }}
              />
            )}
            rules={{
              required: {
                value: true,
                message: '必填项',
              },
              min: {
                value: 1,
                message: '最小为 1',
              },
              max: {
                value: 1234567890,
                message: '最大 1234567890',
              },
            }}
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
 * @param shortUrl 为空则为新建
 */
export function editShortUrl(
  shortUrl = defaultEmptyShortUrl
): Promise<ShortUrl> {
  return NiceModal.show(EditUrlModal, {
    shortUrl,
  })
}
