import { useInjectHistory } from '@/hooks/useInjectHistory'
import { resolvePath } from '@/utils/url'
import { ENV_CONFIG } from '@/config'
import { SilentError } from '@/errors/SilentError'
import { muiDialogV5ReplaceOnClose } from '@/utils/muiDialogV5ReplaceOnClose'
import { copyToClipboard } from '@/utils/copyToClipboard'

import NiceModal, { useModal } from '@ebay/nice-modal-react'
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

import type { SimpleFriendsLink } from '../server'

const sp = '\u00A0'
const sp3 = sp.repeat(3)

export const FriendsLinkResultTip = NiceModal.create(
  ({ link }: { link: SimpleFriendsLink }) => {
    const modal = useModal()
    useInjectHistory(modal.visible, () => {
      modal.reject(new SilentError('操作已取消'))
      void modal.hide()
    })
    const texts =
      link.status === 'ACCEPTED'
        ? [
            `特此告知: 您发起的友链申请已通过;`,
            `请查看 ${resolvePath('/links')} ;`,
            `我站:`,
            `${sp3}- 名称: ${ENV_CONFIG.manifest.name}`,
            `${sp3}- 地址: ${ENV_CONFIG.public.origin}`,
            `你站:`,
            `${sp3}- 名称: ${link.name}`,
            `${sp3}- 地址: ${link.url}`,
          ]
        : [
            `特此告知: 您发起的友链申请未通过;`,
            `我站:`,
            `${sp3}- 名称: ${ENV_CONFIG.manifest.name}`,
            `${sp3}- 地址: ${ENV_CONFIG.public.origin}`,
            `你站:`,
            `${sp3}- 名称: ${link.name}`,
            `${sp3}- 地址: ${link.url}`,
            `原因是:`,
            `${sp3}- `,
            `${sp3}- `,
            `${sp3}- `,
          ]
    return (
      <Dialog {...muiDialogV5ReplaceOnClose(modal)} fullWidth maxWidth='xs'>
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              友链审核结果 tip
            </Typography>
            <IconButton
              edge='end'
              onClick={() => {
                modal.resolve()
                void modal.hide()
              }}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Typography
            sx={{ cursor: 'copy' }}
            onClick={() => copyToClipboard(link.email)}
          >
            邮箱: {link.email}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{ cursor: 'copy' }}
            onClick={() => copyToClipboard(texts.join('\n'))}
          >
            {texts.map((t, i) => (
              <Typography key={`${i}${t}`}>{t}</Typography>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    )
  }
)
