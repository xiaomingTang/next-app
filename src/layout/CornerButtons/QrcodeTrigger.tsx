'use client'

import { AnchorProvider } from '@/components/AnchorProvider'
import { triggerMenuItemEvents } from '@/utils/triggerMenuItemEvents'

import QrCodeIcon from '@mui/icons-material/QrCode'
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus'
import QrCode2Icon from '@mui/icons-material/QrCode2'
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
  scanner: '/qrcode/scan',
  generator: '/qrcode/generate',
}

export function QrcodeTrigger() {
  const router = useRouter()
  const curPathname = usePathname()
  const [scannerEnabled, setScannerEnabled] = useState(false)

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then((res) => {
      const videoInputs = res.filter((item) => item.kind === 'videoinput')
      setScannerEnabled(videoInputs.length > 0)
    })
  }, [])

  return (
    <AnchorProvider>
      {(anchorEl, setAnchorEl) => (
        <>
          <IconButton
            aria-label='二维码菜单'
            aria-controls={anchorEl ? 'header-qrcode-menu' : undefined}
            onClick={(e) => {
              setAnchorEl(e.currentTarget)
            }}
          >
            <QrCodeIcon />
          </IconButton>
          <Menu
            id='header-qrcode-menu'
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
                <FilterCenterFocusIcon />
              </ListItemIcon>
              <ListItemText>
                扫码
                {!scannerEnabled && ' (相机不可用)'}
              </ListItemText>
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
                <QrCode2Icon />
              </ListItemIcon>
              <ListItemText>生成二维码</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </AnchorProvider>
  )
}
