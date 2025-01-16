import { updateProject, type UpdateProjectProps } from '../server'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'
import { useLoading } from '@/hooks/useLoading'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'
import { cat } from '@/errors/catchAndToast'
import { SA, toPlainError } from '@/errors/utils'
import { validateFileName } from '@/utils/string'

import { pick } from 'lodash-es'
import {
  Alert,
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import CloseIcon from '@mui/icons-material/Close'
import { LoadingButton } from '@mui/lab'

import type { SA_RES } from '@/errors/utils'
import type { SimpleProjectItem } from '../utils/arrayToTree'

interface RenameModalProps {
  project: SimpleProjectItem
}

const RenameModal = NiceModal.create(({ project }: RenameModalProps) => {
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new SilentError('操作已取消'))
    void modal.hide()
  })
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control } = useForm<
    Pick<UpdateProjectProps, 'hash' | 'name'>
  >({
    defaultValues: pick(project, ['hash', 'name']),
  })

  return (
    <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
      <AppBar sx={{ paddingRight: '0' }}>
        <Toolbar>
          <Typography sx={{ flex: 1 }} variant='h6' component='div'>
            重命名文件{project.type === 'DIR' ? '夹' : ''}【{project.name}】
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
        <Alert severity='info'>你也可以双击文件（夹）名来重命名。</Alert>
        <form
          className='flex flex-col gap-2 pt-4'
          onSubmit={handleSubmit(
            withLoading(
              cat(async (e) => {
                if (e.name === project.name) {
                  throw new Error('新名称与原名称相同')
                }
                const newProject = await updateProject(e).then(SA.decode)
                modal.resolve(newProject)
                void modal.hide()
              })
            )
          )}
        >
          <Controller
            name='hash'
            control={control}
            render={({ field }) => <input type='hidden' {...field} />}
          />
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                autoFocus
                label='新名称'
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
          <LoadingButton loading={loading} variant='contained' type='submit'>
            提交
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  )
})

/**
 * @param friendsLink 为空则为新建
 */
export function renameProject(
  project: SimpleProjectItem
): Promise<SA_RES<typeof updateProject>> {
  return NiceModal.show(RenameModal, {
    project,
  })
}
