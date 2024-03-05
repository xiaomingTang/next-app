import { usePeerListener } from '../hooks/usePeerListener'
import { usePeer } from '../store/usePeer'
import { isDC } from '../utils'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SlideUpTransition } from '@/components/Transitions'
import { getUserVideo } from '@/utils/media/video'
import { toPlainError } from '@/errors/utils'

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
          onClick={async () => {
            if (!requestConnection) {
              toast.error('连接不存在')
              closeDialog()
              return
            }
            if (isDC(requestConnection)) {
              usePeer.connect(requestConnection.peer)
              closeDialog()
              return
            }
            try {
              const stream = await getUserVideo()
              // TODO: 改为 answer
              // TODO: usePeer 新增 answer
              usePeer.callPeer(requestConnection.peer, stream)
            } catch (err) {
              toast.error(toPlainError(err).message)
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
