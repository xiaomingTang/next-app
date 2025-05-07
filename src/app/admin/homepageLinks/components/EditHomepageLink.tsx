'use client'

import { saveHomepageLink } from '../server'

import { useLoading } from '@/hooks/useLoading'
import { SA } from '@/errors/utils'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { upload } from '@D/upload/components/Uploader'
import { cat } from '@/errors/catchAndToast'
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
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import UploadIcon from '@mui/icons-material/Upload'

import type { HomepageLinks } from '@/generated-prisma-client'
import type { PickAndPartial } from '@/utils/type'

type PartialHomepageLink = PickAndPartial<
  HomepageLinks,
  'createdAt' | 'updatedAt' | 'creatorId' | 'hash' | 'image' | 'description'
>

interface EditHomepageLinkModalProps {
  link: PartialHomepageLink
}

const defaultEmptyLink: PartialHomepageLink = {
  hash: '',
  name: '',
  url: '',
  enabled: true,
}

const EditHomepageLinkModal = NiceModal.create(
  ({ link }: EditHomepageLinkModalProps) => {
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new SilentError('操作已取消'))
      void modal.hide()
    })
    const [loading, withLoading] = useLoading()
    const {
      handleSubmit,
      control,
      setError,
      setValue: setFormValue,
    } = useForm<Pick<HomepageLinks, 'hash' | 'name' | 'url' | 'enabled'>>({
      defaultValues: link,
    })

    return (
      <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              {link.hash ? '编辑首页链接' : '新建首页链接'}
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
                await saveHomepageLink(e)
                  .then(SA.decode)
                  .then((t) => {
                    modal.resolve(t)
                    void modal.hide()
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
              name='url'
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
                <FormControl error={!!error}>
                  <InputLabel>url</InputLabel>
                  <OutlinedInput
                    {...field}
                    label='url'
                    endAdornment={
                      <InputAdornment position='end'>
                        <IconButton
                          className='text-primary-main'
                          aria-label='上传'
                          onClick={cat(async () => {
                            const [fileInfo] = await upload([])
                            const url = fileInfo?.url
                            if (url) {
                              setFormValue('url', url)
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
 * @param link 为空则为新建
 */
export function editHomepageLink(
  link = defaultEmptyLink
): Promise<HomepageLinks> {
  return NiceModal.show(EditHomepageLinkModal, {
    link,
  })
}
