// eslint-disable-next-line import/no-cycle
import { usePeerMessage } from './useMessage'

import { isDC, isMC } from '../utils'

import { withStatic } from '@/utils/withStatic'
import { numberFormat } from '@/utils/numberFormat'

import { create } from 'zustand'
import Peer, { util as peerUtil } from 'peerjs'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import toast from 'react-hot-toast'

import type {
  AnswerOption,
  CallOption,
  DataConnection,
  MediaConnection,
  PeerConnectOption,
} from 'peerjs'
import type { BaseMessageIns, InOutConnection, MessageIns } from '../type'

interface PeerStore {
  peer: Peer
  peerId: string
  connectionInfos: InOutConnection[]
  activeConnectionInfo: InOutConnection | null
}

export const useRawPeer = create<PeerStore>()(
  immer(() => {
    const url = new URL(process.env.NEXT_PUBLIC_PEER_SERVER)
    const secure = url.protocol === 'https:'
    const port = numberFormat(url.port) || (secure ? 443 : 80)
    const peer = new Peer({
      // debug: 3,
      host: url.hostname,
      port,
      secure,
      path: url.pathname,
    })

    peer.once('open', (peerId) => {
      useRawPeer.setState({
        peerId,
      })
    })

    if (!peerUtil.supports.audioVideo && !peerUtil.supports.data) {
      toast.error('你的浏览器不支持 WebRTC')
    }

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
        mc: null,
      }

      if (isDC(connection)) {
        ;(prevConnectionInfo ?? newConnectionInfo).dc[type] = connection
      }
      if (isMC(connection)) {
        ;(prevConnectionInfo ?? newConnectionInfo).mc = connection
      }

      if (!prevConnectionInfo) {
        prev.connectionInfos = [...prev.connectionInfos, newConnectionInfo]
      }
    })
  },
  connect(peerId: string, options?: PeerConnectOption): DataConnection {
    if (!peerUtil.supports.audioVideo && !peerUtil.supports.data) {
      throw new Error('你的浏览器不支持 WebRTC')
    }
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

    const connection = peer.connect(peerId, options)

    usePeer.addConnection(connection, 'out')

    useRawPeer.setState((prev) => ({
      activeConnectionInfo:
        prev.connectionInfos.find((item) => item.targetPeerId === peerId) ??
        null,
    }))

    return connection
  },
  send(data: Omit<MessageIns, keyof BaseMessageIns>, chunked?: boolean) {
    if (!data.value) {
      throw new Error('发送的内容为空')
    }
    const connection = useRawPeer.getState().activeConnectionInfo?.dc.out
    if (!connection?.open) {
      throw new Error('没有可用的连接')
    }
    const baseMessage: BaseMessageIns = {
      id: nanoid(12),
      date: new Date(),
      src: useRawPeer.getState().peerId,
      dest: connection.peer,
    }
    const sendData = {
      ...data,
      ...baseMessage,
    } as MessageIns
    usePeerMessage.addMessage(connection.peer, sendData)
    return connection.send(sendData, chunked)
  },
  callPeer(
    peerId: string,
    stream: MediaStream,
    options?: CallOption
  ): MediaConnection {
    if (!peerId) {
      throw new Error('没有可用的连接')
    }
    const { peer, connectionInfos } = useRawPeer.getState()
    const prevConnectionInfo = connectionInfos.find(
      (item) => item.targetPeerId === peerId
    )

    if (prevConnectionInfo && prevConnectionInfo.mc?.open) {
      useRawPeer.setState({
        activeConnectionInfo: prevConnectionInfo,
      })
      return prevConnectionInfo.mc
    }

    const connection = peer.call(peerId, stream, options)
    usePeer.addConnection(connection, 'out')

    useRawPeer.setState((prev) => ({
      activeConnectionInfo:
        prev.connectionInfos.find((item) => item.targetPeerId === peerId) ??
        null,
    }))

    return connection
  },
  answerPeer(
    connection: MediaConnection,
    stream: MediaStream,
    options?: AnswerOption
  ): MediaConnection {
    const { connectionInfos } = useRawPeer.getState()
    const prevConnectionInfo = connectionInfos.find(
      (item) => item.targetPeerId === connection.peer
    )

    if (prevConnectionInfo && prevConnectionInfo.mc?.open) {
      useRawPeer.setState({
        activeConnectionInfo: prevConnectionInfo,
      })
      return prevConnectionInfo.mc
    }

    prevConnectionInfo?.mc?.close()

    connection.answer(stream, options)
    usePeer.addConnection(connection, 'out')

    useRawPeer.setState((prev) => ({
      activeConnectionInfo:
        prev.connectionInfos.find(
          (item) => item.targetPeerId === connection.peer
        ) ?? null,
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
      return connectionInfos.some((item) => item.mc?.peer === connection.peer)
    }
    return false
  },
})
