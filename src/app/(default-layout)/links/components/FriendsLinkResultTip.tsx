import { useInjectHistory } from '@/hooks/useInjectHistory'
import { resolvePath } from '@/utils/url'
import { ENV_CONFIG } from '@/config'

import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import {
  AppBar,
  Box,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'

import type { SimpleFriendsLink } from '../server'

export const FriendsLinkResultTip = NiceModal.create(
  ({ link }: { link: SimpleFriendsLink }) => {
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new Error('操作已取消'))
      modal.hide()
    })
    const texts =
      link.status === 'ACCEPTED'
        ? [
            `特此告知: 您发起的友链申请已通过;`,
            `请查看 ${resolvePath('/links')} ;`,
            `我站:`,
            `\u00A0\u00A0\u00A0- 名称: ${ENV_CONFIG.manifest.name}`,
            `\u00A0\u00A0\u00A0- 地址: ${ENV_CONFIG.public.origin}`,
            `你站:`,
            `\u00A0\u00A0\u00A0- 名称: ${link.name}`,
            `\u00A0\u00A0\u00A0- 地址: ${link.url}`,
          ]
        : [
            `特此告知: 您发起的友链申请未通过;`,
            `我站:`,
            `\u00A0\u00A0\u00A0- 名称: ${ENV_CONFIG.manifest.name}`,
            `\u00A0\u00A0\u00A0- 地址: ${ENV_CONFIG.public.origin}`,
            `你站:`,
            `\u00A0\u00A0\u00A0- 名称: ${link.name}`,
            `\u00A0\u00A0\u00A0- 地址: ${link.url}`,
            `原因是:`,
            `\u00A0\u00A0\u00A0- `,
            `\u00A0\u00A0\u00A0- `,
            `\u00A0\u00A0\u00A0- `,
          ]
    return (
      <Dialog {...muiDialogV5(modal)} fullWidth maxWidth='xs'>
        <AppBar position='relative' sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              友链审核结果 tip
            </Typography>
            <IconButton
              edge='end'
              onClick={() => {
                modal.resolve()
                modal.hide()
              }}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <CopyToClipboard
            text={link.email}
            onCopy={() => toast.success('复制成功')}
          >
            <Typography sx={{ cursor: 'copy' }}>邮箱: {link.email}</Typography>
          </CopyToClipboard>
          <Divider sx={{ my: 2 }} />
          <CopyToClipboard
            text={texts.join('\n')}
            onCopy={() => toast.success('复制成功')}
          >
            <Box sx={{ cursor: 'copy' }}>
              {texts.map((t) => (
                <Typography key={t}>{t}</Typography>
              ))}
            </Box>
          </CopyToClipboard>
        </DialogContent>
      </Dialog>
    )
  }
)
