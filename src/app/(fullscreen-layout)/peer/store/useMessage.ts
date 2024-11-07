import { usePeer } from './usePeer'

import { usePeerListener } from '../hooks/usePeerListener'
import { isMessageIns } from '../utils'

import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type Peer from 'peerjs'
import type { MessageIns } from '../type'

interface PeerMessageStore {
  messages: Record<string, MessageIns[]>
}

const useRawPeerMessage = create<PeerMessageStore>()(
  immer(() => ({
    messages: {},
  }))
)

export const usePeerMessage = withStatic(useRawPeerMessage, {
  useInit(peer: Peer) {
    /**
     * @WARNING
     * 艹了, connection 需要区分 in / out;
     * peer.on('connection') 拿到的是对方的连接, 可以绑定 data 事件;
     * peer.connect() 返回的是我们自己的连接, 可以发送信息(如 .send);
     */
    usePeerListener(peer, 'connection', (connection) => {
      usePeer.addConnection(connection, 'in')
      connection.on('data', (data) => {
        if (isMessageIns(data)) {
          if (data.type === 'text') {
            usePeerMessage.addMessage(connection.peer, {
              ...data,
              date: new Date(),
            })
          } else {
            usePeerMessage.addMessage(connection.peer, {
              ...data,
              date: new Date(),
              // 此时收到的 data.value 是 ArrayBuffer, 需要转成 Blob
              value: new Blob([data.value], {
                type: data.contentType,
              }),
            })
          }
        }
      })
    })
  },
  addMessage(key: string, message: MessageIns) {
    useRawPeerMessage.setState((prev) => {
      prev.messages[key] = [...(prev.messages[key] ?? []), message]
    })
  },
  removeMessage(key: string, message: MessageIns) {
    useRawPeerMessage.setState((prev) => {
      prev.messages[key] = [...(prev.messages[key] ?? [])].filter(
        (item) => item.id === message.id
      )
    })
  },
})
