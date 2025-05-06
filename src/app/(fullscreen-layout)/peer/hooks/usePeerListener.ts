import { useEffect } from 'react'
import { useEventCallback } from '@mui/material'

import type { DataConnectionEvents, MediaConnectionEvents } from '../type'
import type { DataConnection, MediaConnection, Peer, PeerEvents } from 'peerjs'
import type EventEmitter from 'eventemitter3'

export function usePeerListener<K extends keyof PeerEvents>(
  instance: Peer,
  event: K,
  callback: EventEmitter.EventListener<PeerEvents, K>
) {
  const finalCallback = useEventCallback(callback)

  useEffect(() => {
    instance.addListener(event, finalCallback)

    return () => {
      instance.removeListener(event, finalCallback)
    }
  }, [event, finalCallback, instance])
}

export function useDataConnectionListener<K extends keyof DataConnectionEvents>(
  instance: DataConnection | null,
  event: K,
  callback: EventEmitter.EventListener<DataConnectionEvents, K>
) {
  const finalCallback = useEventCallback(callback)

  useEffect(() => {
    instance?.addListener(event, finalCallback)

    return () => {
      instance?.removeListener(event, finalCallback)
    }
  }, [event, finalCallback, instance])
}

export function useMediaConnectionListener<
  K extends keyof MediaConnectionEvents,
>(
  instance: MediaConnection | null,
  event: K,
  callback: EventEmitter.EventListener<MediaConnectionEvents, K>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalCallback: any = useEventCallback(callback)

  useEffect(() => {
    instance?.addListener(event, finalCallback)

    return () => {
      instance?.removeListener(event, finalCallback)
    }
  }, [event, finalCallback, instance])
}
