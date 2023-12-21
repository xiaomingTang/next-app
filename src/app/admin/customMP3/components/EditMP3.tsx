'use client'

import { saveMP3 } from '../server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { upload } from '@D/upload/components/Uploader'
import { cat } from '@/errors/catchAndToast'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Controller, useForm } from 'react-hook-form'
import {
  AppBar,
  Dialog,
  DialogContent,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import CloseIcon from '@mui/icons-material/Close'
import UploadIcon from '@mui/icons-material/Upload'

import type { CustomMP3 } from '@prisma/client'
import type { PickAndPartial } from '@/utils/type'

type PartialMP3 = PickAndPartial<CustomMP3, 'createdAt' | 'updatedAt'>

interface EditMP3ModalProps {
  mp3: PartialMP3
}

const defaultEmptyMP3: PartialMP3 = {
  hash: '',
  name: '',
  mp3: '',
  lrc: '',
}

const EditMP3Modal = NiceModal.create(({ mp3 }: EditMP3ModalProps) => {
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new Error('操作已取消'))
    modal.hide()
  })
  const [loading, withLoading] = useLoading()
  const {
    handleSubmit,
    control,
    setError,
    setValue: setFormValue,
  } = useForm<Pick<CustomMP3, 'hash' | 'name' | 'mp3' | 'lrc'>>({
    defaultValues: mp3,
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
      <AppBar sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            {mp3.hash ? '编辑歌曲' : '新建歌曲'}
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
              await saveMP3(e)
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
                value: 50,
                message: '最多 50 个字',
              },
            }}
          />

          <Controller
            name='mp3'
            control={control}
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
            render={({ field, fieldState: { error } }) => (
              <FormControl>
                <InputLabel>mp3</InputLabel>
                <OutlinedInput
                  {...field}
                  label='mp3'
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        className='text-primary-main'
                        aria-label='上传'
                        onClick={cat(async () => {
                          const [fileInfo] = await upload([], {
                            accept: 'audio/*',
                          })
                          const url = fileInfo?.url
                          if (url) {
                            setFormValue('mp3', url)
                          }
                        })}
                      >
                        <UploadIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText>{error?.message ?? ' '}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            name='lrc'
            control={control}
            rules={{
              pattern: {
                value: /^(http|ws)s?:\/\/.+\..+$/,
                message: '无效 url',
              },
            }}
            render={({ field, fieldState: { error } }) => (
              <FormControl>
                <InputLabel>lrc</InputLabel>
                <OutlinedInput
                  {...field}
                  label='lrc'
                  endAdornment={
                    <InputAdornment position='end'>
                      <IconButton
                        className='text-primary-main'
                        aria-label='上传'
                        onClick={cat(async () => {
                          const [fileInfo] = await upload([], {
                            accept: '.lrc',
                          })
                          const url = fileInfo?.url
                          if (url) {
                            setFormValue('lrc', url)
                          }
                        })}
                      >
                        <UploadIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
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
})

/**
 * @param mp3 为空则为新建
 */
export function editMP3(mp3 = defaultEmptyMP3): Promise<CustomMP3> {
  return NiceModal.show(EditMP3Modal, {
    mp3,
  })
}
