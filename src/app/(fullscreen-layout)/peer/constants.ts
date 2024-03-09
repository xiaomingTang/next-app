import type { ButtonOwnProps } from '@mui/material'
import type { MessageIns } from './type'
import type { PeerErrorType } from 'peerjs'

export const PEER_ERROR_MAP: Record<PeerErrorType, string> = {
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

export const ALL_MESSAGE_TYPES: MessageIns['type'][] = [
  'text',
  'image',
  'audio',
  'video',
  'file',
]

export const TARGET_PID_SEARCH_PARAM = 'target-pid'

export const CONNECTION_STATE_MAP: Record<
  RTCIceConnectionState,
  {
    text: string
    color: Required<ButtonOwnProps['color']>
  }
> = {
  checking: {
    text: '连接中...',
    color: 'info',
  },
  closed: {
    text: '连接已关闭',
    color: 'error',
  },
  completed: {
    text: '连接已结束',
    color: 'error',
  },
  connected: {
    text: '已连接',
    color: 'primary',
  },
  disconnected: {
    text: '连接已断开',
    color: 'error',
  },
  failed: {
    text: '连接失败',
    color: 'error',
  },
  new: {
    text: '连接中...',
    color: 'info',
  },
}
