import {
  createProject,
  updateProject,
  type UpdateProjectProps,
} from '../server'
import { networkFileTypeInfos } from '../utils/constants'
import { guessFileType } from '../utils/guessFileType'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'
import { useLoading } from '@/hooks/useLoading'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'
import { cat } from '@/errors/catchAndToast'
import { SA, toPlainError } from '@/errors/utils'
import { validateFileName } from '@/utils/string'
import { upload } from '@/app/(default-layout)/upload/components/Uploader'

import { pick } from 'lodash-es'
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
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import CloseIcon from '@mui/icons-material/Close'
import UploadIcon from '@mui/icons-material/Upload'
import { useEffect } from 'react'

import type { Or } from '@zimi/type-utils'
import type { CreateProjectProps } from '../server'
import type { SA_RES } from '@/errors/utils'

type EditNetworkFileModalProps = Or<
  {
    project: UpdateProjectProps
  },
  {
    parentHash: string
  }
>

function isUpdateProjectProps(
  props?: UpdateProjectProps | CreateProjectProps
): props is UpdateProjectProps {
  return !!props && 'hash' in props
}

const EditNetworkFileModal = NiceModal.create(
  ({ project, parentHash }: EditNetworkFileModalProps) => {
    const isUpdate = isUpdateProjectProps(project)
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new SilentError('操作已取消'))
      void modal.hide()
    })
    const [loading, withLoading] = useLoading()
    const {
      handleSubmit,
      control,
      setValue: setFormValue,
      watch: watchFormValues,
    } = useForm<UpdateProjectProps | CreateProjectProps>({
      defaultValues: {
        name: '',
        type: 'UNKNOWN',
        content: '',
        ...pick(project, ['name', 'hash', 'content', 'type']),
        parentHash,
      },
    })
    useEffect(() => {
      const { unsubscribe } = watchFormValues((value, info) => {
        const { content, name, type } = value
        if (info.name === 'content' && info.type === 'change' && content) {
          if (!name) {
            const url = new URL(content, location.href)
            setFormValue(
              'name',
              decodeURIComponent(url.pathname).split('/').pop() ?? ''
            )
          }
          return
        }
        if (info.name === 'name' && info.type === 'change' && name) {
          if (!type || type === 'UNKNOWN') {
            setFormValue('type', guessFileType(name))
          }
        }
      })
      return unsubscribe
    }, [setFormValue, watchFormValues])

    const urlElem = (
      <Controller
        name='content'
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
            <InputLabel>网络链接</InputLabel>
            <OutlinedInput
              {...field}
              label='网络链接'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    className='text-primary-main'
                    aria-label='上传'
                    onClick={cat(async () => {
                      const [fileInfo] = await upload([])
                      const url = fileInfo?.url
                      if (!url) {
                        return
                      }
                      setFormValue('content', url)
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
    const nameElem = (
      <Controller
        name='name'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            autoFocus
            label={isUpdate ? '名称' : '新名称'}
            helperText={error?.message ?? ' '}
            error={!!error}
          />
        )}
        rules={{
          validate: (v) => {
            if (!v) {
              return '必填项'
            }
            try {
              validateFileName(v)
            } catch (error) {
              return toPlainError(error).message
            }
            return true
          },
        }}
      />
    )
    const typeElem = (
      <Controller
        name='type'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl error={!!error} sx={{ minWidth: 200, maxWidth: 500 }}>
            <InputLabel>文件类型</InputLabel>
            <Select
              {...field}
              input={<OutlinedInput label='文件类型' />}
              renderValue={(val) => (
                <>
                  {networkFileTypeInfos.find((item) => item.value === val)
                    ?.label ?? '选择有误'}
                </>
              )}
            >
              {networkFileTypeInfos.map((selection) => (
                <MenuItem key={selection.value} value={selection.value}>
                  {selection.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{error?.message ?? ' '}</FormHelperText>
          </FormControl>
        )}
      />
    )

    return (
      <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              {isUpdate ? '编辑' : '使用'}网络文件
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
            className='flex flex-col gap-2 pt-4'
            onSubmit={handleSubmit(
              withLoading(
                cat(async (e) => {
                  let newProject: SA_RES<typeof updateProject>
                  if (isUpdateProjectProps(e)) {
                    newProject = await updateProject(e).then(SA.decode)
                  } else {
                    newProject = await createProject(e).then(SA.decode)
                  }
                  modal.resolve(newProject)
                  void modal.hide()
                })
              )
            )}
          >
            <Controller
              name={isUpdate ? 'hash' : 'parentHash'}
              control={control}
              render={({ field }) => <input type='hidden' {...field} />}
            />
            {nameElem}
            {urlElem}
            {typeElem}
            <Button loading={loading} variant='contained' type='submit'>
              提交
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
  }
)

export function editNetworkFile(
  props: EditNetworkFileModalProps
): Promise<SA_RES<typeof updateProject>> {
  return NiceModal.show(EditNetworkFileModal, props)
}
