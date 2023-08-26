import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import {
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import LinkIcon from '@mui/icons-material/Link'
import { useMemo } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { toast } from 'react-hot-toast'

import type { QRCode } from 'jsqr'

interface QrcodeDisplayItemProps {
  qrcode: QRCode
  canvasSize: {
    width: number
    height: number
  }
}

function isValidUrl(s: string) {
  try {
    return Boolean(new URL(s))
  } catch (error) {
    return false
  }
}

export function QrcodeDisplayItem({
  qrcode,
  canvasSize,
}: QrcodeDisplayItemProps) {
  const isUrl = useMemo(() => isValidUrl(qrcode.data), [qrcode.data])

  return (
    <AnchorProvider>
      {(settingAnchorEl, setSettingAnchorEl) => (
        <>
          <Button
            variant='contained'
            onClick={(e) => {
              setSettingAnchorEl(e.currentTarget)
            }}
            sx={{
              position: 'absolute',
              width: '3em',
              minWidth: 'unset',
              height: '3em',
              borderRadius: '3em',
              left: `${
                ((qrcode.location.topLeftCorner.x +
                  qrcode.location.bottomRightCorner.x) /
                  2 /
                  canvasSize.width) *
                100
              }%`,
              top: `${
                ((qrcode.location.topLeftCorner.y +
                  qrcode.location.bottomRightCorner.y) /
                  2 /
                  canvasSize.height) *
                100
              }%`,
              transform: 'translate(-50%,-50%)',
              padding: '1em',
            }}
          >
            {isUrl ? (
              <LinkIcon color='inherit' />
            ) : (
              <TextFieldsIcon color='inherit' />
            )}
          </Button>
          <Menu
            id='qrcode-options'
            anchorEl={settingAnchorEl}
            open={!!settingAnchorEl}
            autoFocus
            onClose={() => setSettingAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': '关闭二维码操作菜单',
            }}
            sx={{
              '& .MuiPaper-root': {
                marginTop: 1,
              },
              '& .MuiMenu-list': {
                padding: '4px 0',
              },
            }}
          >
            <CopyToClipboard
              text={qrcode.data}
              onCopy={() => {
                toast.success('复制成功')
                setSettingAnchorEl(null)
              }}
            >
              <MenuItem key='复制'>
                <ListItemIcon>
                  <ContentCopyIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>复制</ListItemText>
              </MenuItem>
            </CopyToClipboard>
            {isUrl && (
              <MenuItem
                key='访问'
                {...triggerMenuItemEvents(() => {
                  setSettingAnchorEl(null)
                  window.open('/', '_blank')
                })}
              >
                <ListItemIcon>
                  <OpenInNewIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>访问</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
