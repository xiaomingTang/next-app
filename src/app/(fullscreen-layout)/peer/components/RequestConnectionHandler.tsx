import { usePeerListener } from '../hooks/usePeerListener'
import { usePeer } from '../store'
import { isDC } from '../utils'
import { messageManager } from '../messageManager'

import { useInjectHistory } from '@/hooks/useInjectHistory'
import { SlideUp } from '@/components/Transitions'
import { getUserMedia } from '@/utils/media'
import { cat } from '@/errors/catchAndToast'

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import type { DataConnection, MediaConnection } from 'peerjs'

function getConnectionType(
  connection: DataConnection | MediaConnection | null
) {
  if (!connection) {
    return 'unknown'
  }
  if (isDC(connection)) {
    return 'data'
  }
  return connection.metadata?.type === 'video' ? 'video' : 'audio'
}

export function RequestConnectionHandler() {
  const { peer } = usePeer()
  const [requestConnection, setRequestConnection] = useState<
    DataConnection | MediaConnection | null
  >(null)
  const connectionType = getConnectionType(requestConnection)

  const closeDialog = () => setRequestConnection(null)

  const connect = cat(async () => {
    if (!requestConnection) {
      throw new Error('连接不存在')
    }
    if (isDC(requestConnection)) {
      return
    }
    const isVideo = getConnectionType(requestConnection) === 'video'
    const stream = await getUserMedia({
      video: isVideo
        ? {
            facingMode: 'user',
          }
        : undefined,
      audio: {
        echoCancellation: true,
      },
    })
    await usePeer.answer(requestConnection, stream)
  })

  useInjectHistory(!!requestConnection, closeDialog)

  usePeerListener(
    peer,
    'connection',
    cat(async (e) => {
      // DataConnection 必须立即添加事件监听，否则就监听不到了
      // TODO: 如果这里一定要同意后再连接，那就只能后续加标志位
      e.on('data', messageManager.handler)
      const { members } = usePeer.getState()
      if (!members[e.peer]) {
        await usePeer.connect(e.peer)
      }
    })
  )

  usePeerListener(peer, 'call', (e) => {
    const { members } = usePeer.getState()
    if (members[e.peer]) {
      setRequestConnection(e)
    }
  })

  return (
    <Dialog
      open={!!requestConnection}
      fullWidth
      slots={{
        transition: SlideUp,
      }}
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
          {connectionType === 'unknown' && '未知连接请求'}
          {connectionType === 'data' && '收到连接请求'}
          {connectionType === 'audio' && '语音通话请求'}
          {connectionType === 'video' && '视频通话请求'}
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
          onClick={() => connect().then(closeDialog)}
        >
          连接
        </Button>
      </DialogActions>
    </Dialog>
  )
}
