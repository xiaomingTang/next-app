import { useEffect } from 'react'
import { useEventCallback } from '@mui/material'

import type { DataConnectionEvents, MediaConnectionEvents } from '../type'
import type { DataConnection, MediaConnection, Peer, PeerEvents } from 'peerjs'
import type { EventListener } from 'eventemitter3'

export function usePeerListener<K extends keyof PeerEvents>(
  instance: Peer,
  event: K,
  callback: EventListener<PeerEvents, K>
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
  callback: EventListener<DataConnectionEvents, K>
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
  callback: EventListener<MediaConnectionEvents, K>
) {
  const finalCallback = useEventCallback(callback)

  useEffect(() => {
    instance?.addListener(event, finalCallback)

    return () => {
      instance?.removeListener(event, finalCallback)
    }
  }, [event, finalCallback, instance])
}
