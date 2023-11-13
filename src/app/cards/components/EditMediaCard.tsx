'use client'

import { saveMediaCard } from '../server'

import { cat } from '@/errors/catchAndToast'
import { SA } from '@/errors/utils'
import { formatTime, friendlyFormatTime } from '@/utils/formatTime'
import { upload } from '@/app/upload/components/Uploader'
import { DefaultDialogTransition } from '@/components/SlideUpTransition'
import { useLoading } from '@/hooks/useLoading'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { numberFormat } from '@/utils/numberFormat'

import { useRouter } from 'next/navigation'
import UploadIcon from '@mui/icons-material/Upload'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import { Controller, useForm } from 'react-hook-form'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Tooltip,
  Typography,
  TextField,
  OutlinedInput,
  InputAdornment,
  DialogContent,
  Stack,
  FormControl,
  InputLabel,
  FormHelperText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { pick } from 'lodash-es'
import { LoadingButton } from '@mui/lab'

import type { MediaCardWithUser } from '../server'

interface MediaCardModalProps {
  mediaCard: Partial<MediaCardWithUser> & {
    type: MediaCardWithUser['type']
  }
}

type FormProps = Pick<MediaCardWithUser, 'title'> &
  Partial<
    Pick<
      MediaCardWithUser,
      'description' | 'image' | 'audio' | 'video' | 'order'
    >
  >

const MediaCardModal = NiceModal.create(
  ({ mediaCard }: MediaCardModalProps) => {
    const router = useRouter()
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new Error('操作已取消'))
      modal.hide()
    })
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('sm'))
    const [loading, withLoading] = useLoading()
    const {
      handleSubmit,
      control,
      setValue: setFormValue,
    } = useForm<FormProps>({
      defaultValues: pick(
        mediaCard,
        'title',
        'description',
        'order',
        'image',
        'audio',
        'video'
      ),
    })

    const onSubmit = withLoading(
      handleSubmit(
        cat(async (e) => {
          const res = await saveMediaCard({
            ...e,
            type: mediaCard.type,
            hash: mediaCard.hash,
            // 艹了, react-hook-form + mui textfield 始终输出不了 number...
            order: numberFormat(e.order),
          }).then(SA.decode)
          router.refresh()
          modal.resolve(res)
          modal.hide()
        })
      )
    )

    const header = (
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar variant='dense'>
          <Box sx={{ flex: 1 }}>
            {mediaCard.hash && mediaCard.updatedAt ? (
              <Tooltip title={`上次编辑于 ${formatTime(mediaCard.updatedAt)}`}>
                <Typography
                  component='span'
                  aria-label={`上次编辑于 ${friendlyFormatTime(
                    mediaCard.updatedAt
                  )}`}
                >
                  上次编辑于 {friendlyFormatTime(mediaCard.updatedAt)}
                </Typography>
              </Tooltip>
            ) : (
              <Typography component='span'>新建</Typography>
            )}
          </Box>
          <IconButton
            edge='end'
            aria-label='取消编辑'
            onClick={() => {
              modal.reject(new Error('操作已取消'))
              modal.hide()
            }}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    )

    const titleElem = (
      <Controller
        name='title'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label='title'
            size='small'
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
            value: 100,
            message: '最多 100 个字',
          },
        }}
      />
    )

    const descriptionElem = (
      <Controller
        name='description'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label='description'
            size='small'
            helperText={error?.message ?? ' '}
            error={!!error}
          />
        )}
        rules={{
          minLength: {
            value: 2,
            message: '最少 2 个字',
          },
          maxLength: {
            value: 200,
            message: '最多 200 个字',
          },
        }}
      />
    )

    const orderElem = (
      <Controller
        name='order'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label='order'
            size='small'
            type='number'
            helperText={error?.message ?? ' '}
            error={!!error}
            inputProps={{
              inputMode: 'numeric',
            }}
          />
        )}
        rules={{
          min: {
            value: 0,
            message: '最小为 0',
          },
          max: {
            value: 1000,
            message: '最大 1000',
          },
        }}
      />
    )

    const imageElem = (
      <Controller
        name='image'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl size='small'>
            <InputLabel>image</InputLabel>
            <OutlinedInput
              {...field}
              label='image'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    className='text-primary-main'
                    aria-label='上传'
                    onClick={cat(async () => {
                      const [fileInfo] = await upload([], { accept: 'image/*' })
                      const url = fileInfo?.url
                      if (url) {
                        setFormValue('image', url)
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
    )

    const audioElem = (
      <Controller
        name='audio'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl size='small'>
            <InputLabel>audio</InputLabel>
            <OutlinedInput
              {...field}
              label='audio'
              size='small'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    className='text-primary-main'
                    aria-label='上传'
                    onClick={cat(async () => {
                      const [fileInfo] = await upload([], { accept: 'audio/*' })
                      const url = fileInfo?.url
                      if (url) {
                        setFormValue('audio', url)
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
    )

    const videoElem = (
      <Controller
        name='video'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl size='small'>
            <InputLabel>video</InputLabel>
            <OutlinedInput
              {...field}
              label='video'
              size='small'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    className='text-primary-main'
                    aria-label='上传'
                    onClick={cat(async () => {
                      const [fileInfo] = await upload([], { accept: 'video/*' })
                      const url = fileInfo?.url
                      if (url) {
                        setFormValue('video', url)
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
    )

    return (
      <Dialog
        fullWidth
        fullScreen={fullScreen}
        // 编辑(hash 非空)或有内容时, 禁用 esc close
        disableEscapeKeyDown={
          !!(mediaCard.hash || mediaCard.title || mediaCard.description)
        }
        TransitionComponent={DefaultDialogTransition}
        {...muiDialogV5(modal)}
        onClose={() => {
          modal.reject(new Error('操作已取消'))
          modal.hide()
        }}
      >
        {header}
        <DialogContent>
          <Stack
            component={'form'}
            direction='column'
            id='EDIT_MEDIA_CARD_FORM_ID'
            onSubmit={onSubmit}
          >
            {titleElem}
            {descriptionElem}
            {orderElem}
            {imageElem}
            {audioElem}
            {videoElem}
          </Stack>
        </DialogContent>
        <DialogActions>
          <LoadingButton
            loading={loading}
            variant='contained'
            form='EDIT_MEDIA_CARD_FORM_ID'
            type='submit'
            sx={{ width: '100%' }}
          >
            提交
          </LoadingButton>
        </DialogActions>
      </Dialog>
    )
  }
)

/**
 * @param mediaCard 为空则为新建
 */
export function editMediaCard(
  mediaCard: MediaCardModalProps['mediaCard']
): Promise<MediaCardWithUser> {
  return NiceModal.show(MediaCardModal, {
    mediaCard,
  })
}
