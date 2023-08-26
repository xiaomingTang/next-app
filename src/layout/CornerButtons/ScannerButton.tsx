'use client'

import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import QrCodeIcon from '@mui/icons-material/QrCode'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import {
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const paths = {
  scanner: '/qr-code/scan',
  generator: '/qr-code/generate',
}

export function QRCodeTrigger() {
  const router = useRouter()
  const curPathname = usePathname()
  const [scannerEnabled, setScannerEnabled] = useState(false)

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((res) => {
      const videoInputs = res.filter((item) => item.kind === 'videoinput')
      setScannerEnabled(videoInputs.length > 0)
    })
  }, [])

  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <IconButton
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
            }}
          >
            <QrCodeIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            autoFocus
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': '关闭二维码功能列表',
            }}
          >
            <MenuItem
              disabled={!scannerEnabled}
              selected={curPathname === paths.scanner}
              {...triggerMenuItemEvents((e, reason) => {
                setAnchorEl(null)
                if (reason === 'middleClick') {
                  window.open(paths.scanner, '_blank')
                } else {
                  router.push(paths.scanner)
                }
              })}
            >
              <ListItemIcon>
                <QrCodeScannerIcon />
              </ListItemIcon>
              <ListItemText>扫码</ListItemText>
            </MenuItem>
            <MenuItem
              selected={curPathname === paths.generator}
              {...triggerMenuItemEvents((e, reason) => {
                setAnchorEl(null)
                if (reason === 'middleClick') {
                  window.open(paths.generator, '_blank')
                } else {
                  router.push(paths.generator)
                }
              })}
            >
              <ListItemIcon>
                <QrCodeIcon />
              </ListItemIcon>
              <ListItemText>生成二维码</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
