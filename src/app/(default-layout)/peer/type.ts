import type {
  BaseConnectionErrorType,
  DataConnection,
  DataConnectionErrorType,
  MediaConnection,
  PeerError,
} from 'peerjs'

export interface InOutConnection {
  /**
   * 对方 peer id
   */
  targetPeerId: string
  /**
   * DataConnection
   */
  dc: {
    in: DataConnection | null
    out: DataConnection | null
  }
  /**
   * MediaConnection
   */
  mc: {
    in: MediaConnection | null
    out: MediaConnection | null
  }
}

interface BaseMessageIns {
  id: string
  date: Date
}

export interface TextMessageIns extends BaseMessageIns {
  type: 'text'
  value: string
}

export interface ImageMessageIns extends BaseMessageIns {
  type: 'image'
  value: string
}

export interface AudioMessageIns extends BaseMessageIns {
  type: 'audio'
  value: string
}

export interface VideoMessageIns extends BaseMessageIns {
  type: 'video'
  value: string
}

export interface FileMessageIns extends BaseMessageIns {
  type: 'file'
  value: string
}

export type MessageIns =
  | TextMessageIns
  | ImageMessageIns
  | AudioMessageIns
  | VideoMessageIns
  | FileMessageIns

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
