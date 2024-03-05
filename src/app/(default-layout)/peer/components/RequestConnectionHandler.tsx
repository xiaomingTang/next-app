import { usePeerListener } from '../hooks/usePeerListener'
import { usePeer } from '../store/usePeer'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SlideUpTransition } from '@/components/Transitions'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import toast from 'react-hot-toast'

import type { DataConnection, MediaConnection } from 'peerjs'

export function RequestConnectionHandler() {
  const { peer } = usePeer()
  const [requestConnection, setRequestConnection] = useState<
    DataConnection | MediaConnection | null
  >(null)

  const closeDialog = () => setRequestConnection(null)

  useInjectHistory(!!requestConnection, closeDialog)

  usePeerListener(peer, 'connection', (e) => {
    if (!usePeer.hasConnection(e)) {
      setRequestConnection(e)
    }
  })

  usePeerListener(peer, 'call', (e) => {
    if (!usePeer.hasConnection(e)) {
      setRequestConnection(e)
    }
  })

  return (
    <Dialog
      open={!!requestConnection}
      fullWidth
      TransitionComponent={SlideUpTransition}
      onClose={closeDialog}
    >
      <DialogTitle>
        <Typography fontWeight='bold' fontSize='1.2em'>
          收到连接请求
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography>对方 ID: {requestConnection?.peer}</Typography>
        {requestConnection?.label && (
          <Typography>对方标签: {requestConnection?.label}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>取消</Button>
        <Button
          onClick={() => {
            const peerId = requestConnection?.peer
            if (peerId) {
              usePeer.connect(peerId)
            } else {
              toast.error('连接不存在')
            }
            closeDialog()
          }}
        >
          连接
        </Button>
      </DialogActions>
    </Dialog>
  )
}
