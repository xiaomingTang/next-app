import {
  useDataConnectionListener,
  useMediaConnectionListener,
  usePeerListener,
} from './usePeerListener'

import { useEffect, useState } from 'react'

import type { Peer, DataConnection, MediaConnection } from 'peerjs'

export function usePeerState(peer: Peer) {
  const [disconnected, setDisconnected] = useState(peer.disconnected)

  usePeerListener(peer, 'open', () => {
    setDisconnected(false)
  })

  usePeerListener(peer, 'connection', () => {
    setDisconnected(false)
  })

  usePeerListener(peer, 'call', () => {
    setDisconnected(false)
  })

  usePeerListener(peer, 'disconnected', () => {
    setDisconnected(true)
  })

  usePeerListener(peer, 'close', () => {
    setDisconnected(true)
  })

  return {
    disconnected,
  }
}

const CONNECTION_TIMEOUT = 5000

export function useDataConnectionState(connection: DataConnection | null) {
  const [state, setState] = useState<RTCIceConnectionState>('new')

  useEffect(() => {
    let timer = -1
    window.clearTimeout(timer)
    if (state === 'checking' || state === 'new') {
      timer = window.setTimeout(() => {
        // timeout
        setState('failed')
      }, CONNECTION_TIMEOUT)
    }
    return () => {
      window.clearTimeout(timer)
    }
  }, [state])

  useDataConnectionListener(connection, 'iceStateChanged', (s) => {
    setState(s)
  })

  useDataConnectionListener(connection, 'close', () => {
    setState('closed')
  })

  useDataConnectionListener(connection, 'error', () => {
    setState('closed')
  })

  return state
}

export function useMediaConnectionState(connection: MediaConnection | null) {
  const [state, setState] = useState<RTCIceConnectionState>('new')

  useEffect(() => {
    let timer = -1
    window.clearTimeout(timer)
    if (state === 'checking' || state === 'new') {
      timer = window.setTimeout(() => {
        // timeout
        setState('failed')
      }, CONNECTION_TIMEOUT)
    }
    return () => {
      window.clearTimeout(timer)
    }
  }, [state])

  useMediaConnectionListener(connection, 'iceStateChanged', (s) => {
    setState(s)
  })

  useMediaConnectionListener(connection, 'close', () => {
    setState('closed')
  })

  useMediaConnectionListener(connection, 'error', () => {
    setState('closed')
  })

  return state
}

export function useConnectionState<T extends DataConnection | MediaConnection>(
  connection: T | null
) {
  const dataState = useDataConnectionState(
    connection?.type === 'data' ? (connection as DataConnection) : null
  )
  const mediaState = useMediaConnectionState(
    connection?.type === 'media' ? (connection as MediaConnection) : null
  )

  return connection?.type === 'data' ? dataState : mediaState
}
