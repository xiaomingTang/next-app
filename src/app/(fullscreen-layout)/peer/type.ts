import type { DataConnection, MediaConnection } from 'peerjs'
import type Peer from 'peerjs'

/**
 * 消息状态
 */
export type MessageStatus =
  | 'pending' // 已创建，待发送
  | 'sent' // 已发送(但未收到回执)
  | 'received' // 对端已收到
  | 'failed' // 发送失败

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'

export interface PayloadMap {
  text: string
  image: File
  audio: File
  video: File
  file: File
  system: {
    type: string
    content: unknown
  }
  /** 回执消息，仅用于更新消息状态，不应添加到消息列表 */
  receipt: {
    receiptForId: string
    value: 'received'
  }
  /** 心跳消息，仅用于保持连接，不应添加到消息列表 */
  ping: null
}

export type MessageType = keyof PayloadMap

export interface BaseMessage<K extends keyof PayloadMap, P = PayloadMap[K]> {
  id: string
  timestamp: number
  from: string
  to: string
  status?: MessageStatus
  type: K
  payload: P
}

export type TextMessage = BaseMessage<'text'>
export type ImageMessage = BaseMessage<'image'>
export type AudioMessage = BaseMessage<'audio'>
export type VideoMessage = BaseMessage<'video'>
export type FileMessage = BaseMessage<'file'>
export type SystemMessage = BaseMessage<'system'>
export type ReceiptMessage = BaseMessage<'receipt'>
export type PingMessage = BaseMessage<'ping'>

export type Message =
  | TextMessage
  | ImageMessage
  | AudioMessage
  | VideoMessage
  | FileMessage
  | SystemMessage
  | ReceiptMessage
  | PingMessage

export interface PeerMember {
  peerId: string
  messages: Message[]
  dc: DataConnection | null
  dcStatus: ConnectionStatus
  mc: MediaConnection | null
  mcStatus: ConnectionStatus
}

export interface PeerState {
  peer: Peer | null
  members: {
    [peerId: string]: PeerMember
  }
  activeMemberId: string | null
}
