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
      onClose={(_, reason) => {
        // 防止误点击, 因此屏蔽 backdropClick
        if (reason === 'backdropClick') {
          return
        }
        closeDialog()
      }}
    >
      <DialogTitle>
        <Typography fontWeight='bold' fontSize='1.2em'>
          {requestConnection?.type === 'data' ? '收到连接请求' : '收到视频请求'}
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
          autoFocus
          variant='contained'
          onClick={async () => {
            try {
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
              const stream = await getUserVideo({
                video: {
                  facingMode: 'user',
                },
                audio: {
                  echoCancellation: true,
                },
              })
              usePeer.answerPeer(requestConnection, stream)
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
