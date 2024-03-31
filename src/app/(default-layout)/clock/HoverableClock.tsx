'use client'

import { useHover } from '@/hooks/useHover'
import { dark } from '@/utils/theme'
import { resolvePath } from '@/utils/url'
import Anchor from '@/components/Anchor'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { useSimulateClick } from '@/hooks/useSimulateClick'

import CloseIcon from '@mui/icons-material/Close'
import {
  AppBar,
  Backdrop,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'
import { grey } from '@mui/material/colors'

import type { BoxProps } from '@mui/material'

interface HoverableClockProps extends BoxProps {
  clockIframePath: string
}

export function HoverableClock({
  clockIframePath,
  children,
  sx,
  ...props
}: HoverableClockProps) {
  const clockHref = resolvePath(clockIframePath).href
  const text = `<iframe src="${clockHref}" style="border: 0; width: 300px; height: 300px;" />`
  const [hover, setElem] = useHover()
  const [dialogOpen, setDialogOpen] = useState(false)
  const setClickElem = useSimulateClick({
    onClick: () => {
      setDialogOpen(true)
    },
  })

  useInjectHistory(dialogOpen, () => {
    setDialogOpen(false)
  })

  return (
    <>
      <Box
        ref={(ref?: HTMLDivElement | null) => {
          setElem(ref)
          setClickElem(ref)
        }}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          ...sx,
        }}
        {...props}
      >
        {children}
        <Backdrop
          open={hover}
          sx={{
            position: 'absolute',
            borderRadius: 1,
            userSelect: 'none',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button variant='contained'>获取同款时钟</Button>
          </Box>
        </Backdrop>
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <AppBar sx={{ paddingRight: '0' }}>
          <Toolbar>
            <Typography sx={{ flex: 1 }} variant='h6' component='div'>
              获取同款时钟
            </Typography>
            <IconButton
              edge='end'
              onClick={() => setDialogOpen(false)}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '300px',
              height: '300px',
              mx: 'auto',
            }}
          >
            {children}
          </Box>
          <Typography my={1}>
            表盘来自{' '}
            <Anchor href='https://free-dxf.com/public/vectors-doors/free-download?search=clock'>
              free-dxf.com
            </Anchor>
          </Typography>
          <Typography my={1}>
            复制下面的 iframe，粘贴到你的网站，你也能拥有同款时钟
          </Typography>
          <CopyToClipboard
            text={text}
            onCopy={() => {
              toast.success('复制成功')
            }}
          >
            <Typography
              sx={{
                p: 1,
                borderRadius: 1,
                wordBreak: 'break-word',
                cursor: 'copy',
                backgroundColor: grey[200],
                [dark()]: {
                  backgroundColor: grey[600],
                },
              }}
            >
              {text}
            </Typography>
          </CopyToClipboard>
        </DialogContent>
      </Dialog>
    </>
  )
}
