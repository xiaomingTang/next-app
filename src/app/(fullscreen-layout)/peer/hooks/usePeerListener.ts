import { useEffect } from 'react'
import { useEventCallback } from '@mui/material'

import type {
  BaseConnectionErrorType,
  DataConnection,
  DataConnectionErrorType,
  MediaConnection,
  Peer,
  PeerError,
  PeerEvents,
} from 'peerjs'
import type EventEmitter from 'eventemitter3'

interface EventsWithError<ErrorType extends string> {
  error: (error: PeerError<`${ErrorType}`>) => void
}

interface BaseConnectionEvents<
  ErrorType extends string = BaseConnectionErrorType,
> extends EventsWithError<ErrorType> {
  /**
   * Emitted when either you or the remote peer closes the connection.
   *
   * ```ts
   * connection.on('close', () => { ... });
   * ```
   */
  close: () => void
  /**
   * ```ts
   * connection.on('error', (error) => { ... });
   * ```
   */
  error: (error: PeerError<`${ErrorType}`>) => void
  iceStateChanged: (state: RTCIceConnectionState) => void
}

export interface DataConnectionEvents
  extends EventsWithError<DataConnectionErrorType | BaseConnectionErrorType>,
    BaseConnectionEvents<DataConnectionErrorType | BaseConnectionErrorType> {
  /**
   * Emitted when data is received from the remote peer.
   */
  data: (data: unknown) => void
  /**
   * Emitted when the connection is established and ready-to-use.
   */
  open: () => void
}

export interface MediaConnectionEvents extends BaseConnectionEvents<never> {
  /**
   * Emitted when a connection to the PeerServer is established.
   *
   * ```ts
   * mediaConnection.on('stream', (stream) => { ... });
   * ```
   */
  stream: (stream: MediaStream) => void
  /**
   * Emitted when the auxiliary data channel is established.
   * After this event, hanging up will close the connection cleanly on the remote peer.
   * @beta
   */
  willCloseOnRemote: () => void
}

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
