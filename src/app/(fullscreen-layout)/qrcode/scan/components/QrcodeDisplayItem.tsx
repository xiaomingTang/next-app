import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'
import { geneRunOnly } from '@/utils/runOnce'
import { useVisibilityState } from '@/hooks/useVisibilityState'
import { isValidUrl } from '@/utils/url'
import { isPointInsideQuadrilateral } from '@/utils/math'
import { copyToClipboard } from '@/utils/copyToClipboard'

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
import { useEffect, useMemo, useState } from 'react'

import type { QRCode } from 'jsqr'

interface QrcodeDisplayItemProps {
  qrcode: QRCode
  canvasSize: {
    width: number
    height: number
  }
}

export function QrcodeDisplayItem({
  qrcode,
  canvasSize,
}: QrcodeDisplayItemProps) {
  const isUrl = useMemo(() => isValidUrl(qrcode.data), [qrcode.data])
  const visibilityState = useVisibilityState()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runOnce = useMemo(() => geneRunOnly(1), [qrcode.data, visibilityState])
  const [point, setPoint] = useState({ x: -1, y: -1 })

  useEffect(() => {
    setPoint((prev) => {
      const {
        topLeftCorner,
        topRightCorner,
        bottomLeftCorner,
        bottomRightCorner,
      } = qrcode.location
      if (
        prev.x > 0 &&
        prev.y > 0 &&
        isPointInsideQuadrilateral(prev, [
          topLeftCorner,
          topRightCorner,
          bottomRightCorner,
          bottomLeftCorner,
        ])
      ) {
        return prev
      }
      return {
        x: (topLeftCorner.x + bottomRightCorner.x) / 2,
        y: (topLeftCorner.y + bottomRightCorner.y) / 2,
      }
    })
  }, [qrcode.location])

  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <Button
            ref={(e) => {
              if (e) {
                runOnce(() => setAnchorEl(e))
              }
            }}
            variant='contained'
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
            }}
            sx={{
              position: 'absolute',
              width: '3em',
              minWidth: 'unset',
              height: '3em',
              borderRadius: '3em',
              left: `${(point.x / canvasSize.width) * 100}%`,
              top: `${(point.y / canvasSize.height) * 100}%`,
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
            anchorEl={anchorEl}
            open={!!anchorEl}
            autoFocus
            onClose={() => setAnchorEl(null)}
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
            <MenuItem
              key='复制'
              onClick={() => {
                void copyToClipboard(qrcode.data)
                setAnchorEl(null)
              }}
            >
              <ListItemIcon>
                <ContentCopyIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>复制</ListItemText>
            </MenuItem>
            {isUrl && (
              <MenuItem
                key='访问'
                {...triggerMenuItemEvents(() => {
                  setAnchorEl(null)
                  window.open(qrcode.data, '_blank')
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
