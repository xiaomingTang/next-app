'use client'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
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

interface SimpleModalProps {
  title: React.ReactNode
  content: React.ReactNode
}

const SimpleModal = NiceModal.create(({ title, content }: SimpleModalProps) => {
  const modal = useModal()
  useInjectHistory(modal.visible, () => {
    modal.reject(new SilentError('操作已取消'))
    modal.hide()
  })

  return (
    <Dialog
      {...muiDialogV5(modal)}
      fullWidth
      maxWidth='xs'
      onClose={() => {
        modal.reject(new SilentError('操作已取消'))
        modal.hide()
      }}
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
              modal.hide()
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
            modal.hide()
          }}
        >
          取消
        </Button>
        <Button
          autoFocus
          variant='contained'
          onClick={() => {
            modal.resolve()
            modal.hide()
          }}
        >
          确定
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export function openSimpleModal(props: SimpleModalProps): Promise<void> {
  return NiceModal.show(SimpleModal, props)
}
