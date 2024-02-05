'use client'

import { DefaultDialogTransition } from '@/components/Transitions'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface IframeModalProps {
  title?: React.ReactNode | React.ReactNode[]
  url: URL
}

const IframeModal = NiceModal.create(({ title, url }: IframeModalProps) => {
  const modal = useModal()
  const fullScreen = useMediaQuery(useTheme().breakpoints.down('md'))

  useInjectHistory(modal.visible, () => {
    modal.reject(new SilentError('操作已取消'))
    modal.hide()
  })

  const header = (
    <AppBar>
      <Toolbar>
        <Box sx={{ flex: 1 }}>{title}</Box>
        <IconButton
          edge='end'
          aria-label='关闭弹窗'
          onClick={() => {
            modal.reject(new SilentError('操作已取消'))
            modal.hide()
          }}
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      maxWidth='md'
      TransitionComponent={DefaultDialogTransition}
      {...muiDialogV5(modal)}
      onClose={() => {
        modal.reject(new SilentError('操作已取消'))
        modal.hide()
      }}
    >
      {header}
      <iframe src={url.href} className='border-none m-0 p-0 h-[100vh]' />
    </Dialog>
  )
})

export async function showIframe(input: IframeModalProps): Promise<void> {
  return NiceModal.show(IframeModal, input)
}
