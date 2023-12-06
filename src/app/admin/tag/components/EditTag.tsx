'use client'

import { saveTag } from '../server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'
import { useInjectHistory } from '@/hooks/useInjectHistory'

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
import CloseIcon from '@mui/icons-material/Close'

import type { Tag } from '@prisma/client'
import type { PickAndPartial } from '@/utils/type'

interface EditTagModalProps {
  tag: PartialTag
}

type PartialTag = PickAndPartial<Tag, 'createdAt' | 'creatorId' | 'updatedAt'>

const defaultEmptyTag: PartialTag = {
  hash: '',
  name: '',
  description: '',
}

const EditTagModal = NiceModal.create(({ tag }: EditTagModalProps) => {
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new Error('操作已取消'))
    modal.hide()
  })
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control, setError } = useForm<
    Pick<Tag, 'hash' | 'name' | 'description'>
  >({
    defaultValues: tag,
  })

  return (
    <Dialog
      {...muiDialogV5(modal)}
      fullWidth
      maxWidth='xs'
      onClose={() => {
        modal.reject(new Error('操作已取消'))
        modal.hide()
      }}
    >
      <AppBar position='relative' sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            {tag.hash ? '编辑标签' : '新建标签'}
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
              await saveTag(e)
                .then(SA.decode)
                .then((t) => {
                  modal.resolve(t)
                  modal.hide()
                })
                .catch((err) => {
                  setError('name', {
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
                label='name'
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
                value: 2,
                message: '最少 2 个字',
              },
              maxLength: {
                value: 16,
                message: '最多 16 个字',
              },
            }}
          />
          <Controller
            name='description'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label='description'
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
                value: 2,
                message: '最少 2 个字',
              },
              maxLength: {
                value: 66,
                message: '最多 66 个字',
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
})

/**
 * @param tag 为空则为新建
 */
export function editTag(tag = defaultEmptyTag): Promise<Tag> {
  return NiceModal.show(EditTagModal, {
    tag,
  })
}
