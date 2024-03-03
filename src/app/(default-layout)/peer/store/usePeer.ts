import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { Peer } from 'peerjs'

import type { Connections } from '../constants'
import type {
  CallOption,
  DataConnection,
  MediaConnection,
  PeerConnectOption,
} from 'peerjs'

interface PeerStore {
  peer: Peer
  peerId: string
  dataConnections: DataConnection[]
  mediaConnections: MediaConnection[]
  activeConnection: Connections
}

const useRawPeer = create<PeerStore>(() => {
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
    dataConnections: [],
    mediaConnections: [],
    activeConnection: {
      type: 'data',
      connection: null,
    },
  }
})

export const usePeer = withStatic(useRawPeer, {
  connect(peerId: string, options?: PeerConnectOption): DataConnection {
    const { peer, dataConnections: prevConnections } = useRawPeer.getState()
    const prevConnection = prevConnections.find((item) => item.peer === peerId)

    if (prevConnection && prevConnection.open) {
      useRawPeer.setState({
        activeConnection: {
          type: 'data',
          connection: prevConnection,
        },
      })
      return prevConnection
    }

    prevConnection?.close()

    const connection = peer.connect(peerId, options)

    useRawPeer.setState(() => ({
      dataConnections: [
        connection,
        ...prevConnections.filter((item) => item.peer !== peerId),
      ],
      activeConnection: {
        type: 'data',
        connection,
      },
    }))

    return connection
  },
  callPeer(
    peerId: string,
    stream: MediaStream,
    options?: CallOption
  ): MediaConnection {
    const { peer, mediaConnections: prevConnections } = useRawPeer.getState()
    const prevConnection = prevConnections.find((item) => item.peer === peerId)

    if (prevConnection && prevConnection.open) {
      useRawPeer.setState({
        activeConnection: {
          type: 'media',
          connection: prevConnection,
        },
      })
      return prevConnection
    }

    prevConnection?.close()

    const connection = peer.call(peerId, stream, options)

    useRawPeer.setState(() => ({
      mediaConnections: [
        connection,
        ...prevConnections.filter((item) => item.peer !== peerId),
      ],
      activeConnection: {
        type: 'media',
        connection,
      },
    }))

    return connection
  },
  hasConnection(connection: DataConnection | MediaConnection | null) {
    if (!connection) {
      return false
    }
    const { dataConnections, mediaConnections } = useRawPeer.getState()
    if (connection.type === 'data') {
      return dataConnections.some((item) => item.peer === connection.peer)
    }
    if (connection.type === 'media') {
      return mediaConnections.some((item) => item.peer === connection.peer)
    }
    return false
  },
})
