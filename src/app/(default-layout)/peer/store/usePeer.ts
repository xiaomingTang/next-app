import { isDC, isMC } from '../utils'

import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import Peer from 'peerjs'
import { immer } from 'zustand/middleware/immer'

import type {
  CallOption,
  DataConnection,
  MediaConnection,
  PeerConnectOption,
} from 'peerjs'
import type { InOutConnection, MessageIns } from '../type'

interface PeerStore {
  peer: Peer
  peerId: string
  connectionInfos: InOutConnection[]
  activeConnectionInfo: InOutConnection | null
}

export const useRawPeer = create<PeerStore>()(
  immer(() => {
    const url = new URL(process.env.NEXT_PUBLIC_PEER_SERVER)
    const peer = new Peer({
      // debug: 3,
      host: url.hostname,
      port: +url.port,
      secure: url.protocol === 'https:',
      path: url.pathname,
    })

    peer.once('open', (peerId) => {
      useRawPeer.setState({
        peerId,
      })
    })

    console.log('[peer]: created')

    return {
      peer,
      peerId: '',
      connectionInfos: [] as InOutConnection[],
      activeConnectionInfo: null as InOutConnection | null,
    }
  })
)

export const usePeer = withStatic(useRawPeer, {
  addConnection(
    connection: DataConnection | MediaConnection,
    type: 'in' | 'out'
  ) {
    const peerId = connection.peer

    useRawPeer.setState((prev) => {
      const prevConnectionInfo = prev.connectionInfos.find(
        (item) => item.targetPeerId === peerId
      )

      const newConnectionInfo: InOutConnection = {
        targetPeerId: peerId,
        dc: {
          in: null,
          out: null,
        },
        mc: {
          in: null,
          out: null,
        },
      }

      if (isDC(connection)) {
        ;(prevConnectionInfo ?? newConnectionInfo).dc[type] = connection
      }
      if (isMC(connection)) {
        ;(prevConnectionInfo ?? newConnectionInfo).mc[type] = connection
      }

      if (!prevConnectionInfo) {
        prev.connectionInfos = [...prev.connectionInfos, newConnectionInfo]
      }
    })
  },
  connect(peerId: string, options?: PeerConnectOption): DataConnection {
    const { peer, connectionInfos } = useRawPeer.getState()
    const prevConnectionInfo = connectionInfos.find(
      (item) => item.targetPeerId === peerId
    )

    if (prevConnectionInfo && prevConnectionInfo.dc.out?.open) {
      useRawPeer.setState({
        activeConnectionInfo: prevConnectionInfo,
      })
      return prevConnectionInfo.dc.out
    }

    prevConnectionInfo?.dc.out?.close()

    const connection = peer.connect(peerId, options)

    usePeer.addConnection(connection, 'out')

    useRawPeer.setState((prev) => ({
      activeConnectionInfo:
        prev.connectionInfos.find((item) => item.targetPeerId === peerId) ??
        null,
    }))

    return connection
  },
  send(data: MessageIns, chunked?: boolean) {
    if (!data.value) {
      throw new Error('发送的内容为空')
    }
    const connection = useRawPeer.getState().activeConnectionInfo?.dc.out
    if (!connection?.open) {
      throw new Error('没有可用的连接')
    }
    return connection.send(data, chunked)
  },
  callPeer(
    peerId: string,
    stream: MediaStream,
    options?: CallOption
  ): MediaConnection {
    const { peer, connectionInfos } = useRawPeer.getState()
    const prevConnectionInfo = connectionInfos.find(
      (item) => item.targetPeerId === peerId
    )

    if (prevConnectionInfo && prevConnectionInfo.mc.out?.open) {
      useRawPeer.setState({
        activeConnectionInfo: prevConnectionInfo,
      })
      return prevConnectionInfo.mc.out
    }

    prevConnectionInfo?.mc.out?.close()

    const connection = peer.call(peerId, stream, options)
    usePeer.addConnection(connection, 'out')

    useRawPeer.setState((prev) => ({
      activeConnectionInfo:
        prev.connectionInfos.find((item) => item.targetPeerId === peerId) ??
        null,
    }))

    return connection
  },
  hasConnection(connection: DataConnection | MediaConnection | null) {
    if (!connection) {
      return false
    }
    const { connectionInfos } = useRawPeer.getState()
    if (isDC(connection)) {
      return connectionInfos.some(
        (item) => item.dc.out?.peer === connection.peer
      )
    }
    if (isMC(connection)) {
      return connectionInfos.some(
        (item) => item.mc.out?.peer === connection.peer
      )
    }
    return false
  },
})
