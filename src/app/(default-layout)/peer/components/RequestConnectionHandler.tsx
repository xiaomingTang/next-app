import { usePeerListener } from '../hooks/usePeerListener'
import { usePeer } from '../store'

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

import type { Connections } from '../constants'

export function RequestConnectionHandler() {
  const { peer } = usePeer()
  const [requestConnection, setRequestConnection] = useState<Connections>({
    type: 'data',
    connection: null,
  })

  const closeDialog = () =>
    setRequestConnection({
      type: 'data',
      connection: null,
    })

  useInjectHistory(!!requestConnection.connection, closeDialog)

  usePeerListener(peer, 'connection', (e) => {
    if (!usePeer.hasConnection(e)) {
      setRequestConnection({
        type: 'data',
        connection: e,
      })
    }
  })

  usePeerListener(peer, 'call', (e) => {
    if (!usePeer.hasConnection(e)) {
      setRequestConnection({
        type: 'media',
        connection: e,
      })
    }
  })

  return (
    <Dialog
      open={!!requestConnection.connection}
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
        <Typography>对方 ID: {requestConnection.connection?.peer}</Typography>
        {requestConnection.connection?.label && (
          <Typography>
            对方标签: {requestConnection.connection?.label}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog}>取消</Button>
        <Button
          onClick={() => {
            const peerId = requestConnection.connection?.peer
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
