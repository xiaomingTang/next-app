import { usePeerState } from '../hooks/usePeerState'
import { usePeer } from '../store'

import { Button, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'

export function SelfPeer() {
  const { peer, peerId } = usePeer()
  const { disconnected: peerDisconnected } = usePeerState(peer)
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
        title={peerDisconnected ? '连接已断开' : undefined}
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
