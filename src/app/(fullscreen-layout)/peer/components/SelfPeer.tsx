import { usePeerError, usePeerState } from '../hooks/usePeerState'
import { usePeer } from '../store'
import { PEER_ERROR_MAP, TARGET_PID_SEARCH_PARAM } from '../constants'

import { useIsOnline } from '@/hooks/useIsOnline'
import { useListen } from '@/hooks/useListen'
import { useVisibilityState } from '@/hooks/useVisibilityState'
import { openSimpleModal } from '@/components/SimpleModal'
import { copyToClipboard } from '@/utils/copyToClipboard'

import QrCode2Icon from '@mui/icons-material/QrCode2'
import { Button, Stack, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { QRCodeSVG } from 'qrcode.react'
import { noop } from 'lodash-es'
import { useMemo } from 'react'

export function SelfPeer() {
  const isOnline = useIsOnline()
  const isVisible = useVisibilityState()
  const { peer } = usePeer()
  const peerId = peer.id
  const { disconnected: peerDisconnected } = usePeerState(peer)
  const peerError = usePeerError(peer)
  const localUrl = useMemo(() => {
    const url = new URL(window.location.href)
    url.searchParams.set(TARGET_PID_SEARCH_PARAM, peerId)
    return url
  }, [peerId])

  useListen(`${isOnline}-${isVisible}-${peerError?.type === 'network'}`, () => {
    if (isOnline && isVisible && peerError?.type === 'network') {
      peer.reconnect()
    }
  })

  // TODO: 万一 ws 连接延迟导致 peerId 生成有问题，需要提供重试
  return (
    <Stack
      direction='row'
      spacing={1}
      sx={{
        width: '100%',
        maxWidth: '450px',
      }}
    >
      <Button
        variant='outlined'
        color={peerDisconnected ? 'error' : 'primary'}
        title={peerError?.type && PEER_ERROR_MAP[peerError.type]}
        sx={{
          width: '100%',
        }}
        onClick={() => {
          void copyToClipboard(
            localUrl.searchParams.get(TARGET_PID_SEARCH_PARAM) ?? ''
          )
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
      <Button
        variant='outlined'
        color={peerDisconnected ? 'error' : 'primary'}
        aria-label='分享当前页面连接二维码'
        onClick={() => {
          openSimpleModal({
            title: '扫码连接',
            content: (
              <Stack sx={{ justifyContent: 'center', alignItems: 'center' }}>
                <QRCodeSVG value={localUrl.href} size={148} />
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
