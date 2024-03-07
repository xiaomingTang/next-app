import { usePeerError, usePeerState } from '../hooks/usePeerState'
import { usePeer } from '../store/usePeer'
import { PeerErrorMap } from '../constants'

import { useIsOnline } from '@/hooks/useIsOnline'
import { useListen } from '@/hooks/useListen'
import { useVisibilityState } from '@/hooks/useVisibilityState'

import { Button, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'

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
    <CopyToClipboard
      text={peerId}
      onCopy={() => {
        toast.success('复制成功')
      }}
    >
      <Button
        variant='outlined'
        color={peerDisconnected ? 'error' : 'primary'}
        title={peerError?.type && PeerErrorMap[peerError.type]}
        sx={{
          width: '100%',
          maxWidth: '410px',
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
  )
}
