import type {
  BaseConnectionErrorType,
  DataConnection,
  DataConnectionErrorType,
  MediaConnection,
  PeerError,
  PeerErrorType,
} from 'peerjs'

export type Connections =
  | {
      type: 'data'
      connection: DataConnection | null
    }
  | {
      type: 'media'
      connection: MediaConnection | null
    }

export const PeerErrorMap: Record<PeerErrorType, string> = {
  /**
   * The client's browser does not support some or all WebRTC features that you are trying to use.
   */
  'browser-incompatible': '浏览器不支持',
  /**
   * You've already disconnected this peer from the server and can no longer make any new connections on it.
   */
  disconnected: '连接已断开',
  /**
   * The ID passed into the Peer constructor contains illegal characters.
   */
  'invalid-id': '连接 id 无效',
  /**
   * The API key passed into the Peer constructor contains illegal characters or is not in the system (cloud server only).
   */
  'invalid-key': '无法连接到云服务器',
  /**
   * Lost or cannot establish a connection to the signalling server.
   */
  network: '和服务器断开连接（可能是网络问题）',
  /**
   * The peer you're trying to connect to does not exist.
   */
  'peer-unavailable': '连接不存在',
  /**
   * PeerJS is being used securely, but the cloud server does not support SSL. Use a custom PeerServer.
   */
  'ssl-unavailable': '不支持 https',
  /**
   * Unable to reach the server.
   */
  'server-error': '服务器错误，请稍后再试',
  /**
   * An error from the underlying socket.
   */
  'socket-error': 'socket 连接出错',
  /**
   * The underlying socket closed unexpectedly.
   */
  'socket-closed': 'socket 连接意外关闭',
  /**
   * The ID passed into the Peer constructor is already taken.
   *
   * :::caution
   * This error is not fatal if your peer has open peer-to-peer connections.
   * This can happen if you attempt to {@apilink Peer.reconnect} a peer that has been disconnected from the server,
   * but its old ID has now been taken.
   * :::
   */
  'unavailable-id': '对方的连接 id 不可用，请让对方更新 id',
  /**
   * Native WebRTC errors.
   */
  webrtc: 'webrtc 错误',
}

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
