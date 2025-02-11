'use client'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'
import { uniqueFunc } from '@/utils/function'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'

import NiceModal, { useModal } from '@ebay/nice-modal-react'
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import type { DialogProps } from '@mui/material'

interface SimpleModalProps {
  title: React.ReactNode
  content: React.ReactNode
  dialogProps?: Partial<Omit<DialogProps, 'children' | 'open' | 'onClose'>>
}

const SimpleModal = NiceModal.create(
  ({ title, content, dialogProps }: SimpleModalProps) => {
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new SilentError('操作已取消'))
      void modal.hide()
    })

    return (
      <Dialog
        {...muiDialogV5ReplaceOnClose(modal)}
        fullWidth
        maxWidth='xs'
        {...dialogProps}
      >
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              {title}
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
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              modal.reject(new SilentError('操作已取消'))
              void modal.hide()
            }}
          >
            取消
          </Button>
          <Button
            autoFocus
            variant='contained'
            onClick={() => {
              modal.resolve()
              void modal.hide()
            }}
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)

export function openSimpleModal(props: SimpleModalProps): Promise<void> {
  return NiceModal.show(uniqueFunc(SimpleModal), props)
}
