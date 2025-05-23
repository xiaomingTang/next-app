import {
  useDataConnectionListener,
  useMediaConnectionListener,
  usePeerListener,
} from './usePeerListener'

import { isDC, isMC } from '../utils'

import { useListen } from '@/hooks/useListen'

import { useEffect, useState } from 'react'

import type {
  Peer,
  DataConnection,
  MediaConnection,
  PeerError,
  PeerErrorType,
} from 'peerjs'

export function usePeerState(peer: Peer | null) {
  const [disconnected, setDisconnected] = useState(peer?.disconnected ?? true)

  useListen(peer, () => {
    if (peer) {
      setDisconnected(peer.disconnected)
    }
  })

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

export function usePeerError(peer: Peer | null) {
  const { disconnected } = usePeerState(peer)
  const [error, setError] = useState<PeerError<`${PeerErrorType}`> | null>(null)

  useListen(disconnected, () => {
    if (!disconnected) {
      setError(null)
    }
  })

  usePeerListener(peer, 'error', (e) => {
    setError(e)
  })

  return error
}

const CONNECTION_TIMEOUT = 10000

export function useDataConnectionState(
  connection: DataConnection | null
): RTCIceConnectionState {
  const [state, setState] = useState<RTCIceConnectionState>('new')

  useEffect(() => {
    let timer = -1
    window.clearTimeout(timer)
    if (state === 'checking') {
      timer = window.setTimeout(() => {
        console.error('connection timeout')
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

export function useMediaConnectionState(
  connection: MediaConnection | null
): RTCIceConnectionState {
  const [state, setState] = useState<RTCIceConnectionState>('new')

  useEffect(() => {
    let timer = -1
    window.clearTimeout(timer)
    if (state === 'checking') {
      timer = window.setTimeout(() => {
        console.error('connection timeout')
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
): RTCIceConnectionState {
  const dataState = useDataConnectionState(
    connection && isDC(connection) ? connection : null
  )
  const mediaState = useMediaConnectionState(
    connection && isMC(connection) ? connection : null
  )

  if (!connection) {
    return 'disconnected'
  }

  if (isMC(connection)) {
    return mediaState
  }

  return dataState
}
