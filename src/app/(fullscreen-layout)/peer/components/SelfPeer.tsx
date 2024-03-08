import { usePeerError, usePeerState } from '../hooks/usePeerState'
import { usePeer } from '../store/usePeer'
import { PeerErrorMap, TARGET_PID_SEARCH_PARAM } from '../constants'

import { useIsOnline } from '@/hooks/useIsOnline'
import { useListen } from '@/hooks/useListen'
import { useVisibilityState } from '@/hooks/useVisibilityState'
import { openSimpleModal } from '@/components/SimpleModal'

import QrCode2Icon from '@mui/icons-material/QrCode2'
import { Button, Stack, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { noop } from 'lodash-es'

export function SelfPeer() {
  const isOnline = useIsOnline()
  const isVisible = useVisibilityState()
  const { peer, peerId } = usePeer()
  const { disconnected: peerDisconnected } = usePeerState(peer)
  const peerError = usePeerError(peer)

  useListen(isOnline, () => {
    if (isOnline && peerError?.type === 'network') {
      peer.reconnect()
    }
  })

  useListen(isVisible, () => {
    if (isVisible && peerError?.type === 'network') {
      peer.reconnect()
    }
  })

  return (
    <Stack
      direction='row'
      spacing={1}
      sx={{
        width: '100%',
        maxWidth: '450px',
      }}
    >
      <CopyToClipboard
        text={peerId}
        onCopy={() => {
          if (peerId) {
            toast.success('复制成功')
          } else {
            toast.error('未连接到 peer 服务器')
          }
        }}
      >
        <Button
          variant='outlined'
          color={peerDisconnected ? 'error' : 'primary'}
          title={peerError?.type && PeerErrorMap[peerError.type]}
          sx={{
            width: '100%',
          }}
        >
          我的 ID:
          <Typography
            sx={{
              mx: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {peerId}
          </Typography>
          {peerId && <ContentCopyIcon fontSize='inherit' />}
        </Button>
      </CopyToClipboard>
      <Button
        variant='outlined'
        color={peerDisconnected ? 'error' : 'primary'}
        aria-label='分享当前页面连接二维码'
        onClick={() => {
          if (!peerId) {
            toast.error('未连接到 peer 服务器')
            return
          }
          const url = new URL(window.location.href)
          url.searchParams.set(TARGET_PID_SEARCH_PARAM, peerId)
          openSimpleModal({
            title: '扫码连接',
            content: (
              <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <QRCodeSVG value={url.href} size={148} />
              </Stack>
            ),
          }).catch(noop)
        }}
      >
        <QrCode2Icon />
      </Button>
    </Stack>
  )
}
