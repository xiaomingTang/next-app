import { QrcodeLogin } from './QrcodeLogin'
import { EmailLogin } from './EmailLogin'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SilentError } from '@/errors/SilentError'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import {
  AppBar,
  Dialog,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'

import type { LoginType } from './type'

export const LoginModal = NiceModal.create(
  ({ defaultLoginType = 'email' }: { defaultLoginType?: LoginType }) => {
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new SilentError('操作已取消'))
      modal.hide()
    })
    const [loginType, setLoginType] = useState(defaultLoginType)

    return (
      <Dialog
        {...muiDialogV5(modal)}
        fullWidth
        maxWidth='xs'
        onClose={(e, reason) => {
          // disable backdrop close
          if (reason === 'backdropClick') {
            return
          }
          modal.reject(new SilentError('操作已取消'))
          modal.hide()
        }}
      >
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              {loginType === 'email' ? '登录' : '扫码登录'}
            </Typography>
            <IconButton
              edge='end'
              onClick={() => {
                modal.reject(new SilentError('操作已取消'))
                modal.hide()
              }}
              aria-label='关闭登录弹窗'
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <EmailLogin loginType={loginType} setLoginType={setLoginType} />
          <QrcodeLogin loginType={loginType} setLoginType={setLoginType} />
        </DialogContent>
      </Dialog>
    )
  }
)
