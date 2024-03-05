import type { MessageIns } from './type'
import type { DataConnection, MediaConnection } from 'peerjs'

/**
 * isDataConnection
 */
export function isDC(
  connection: DataConnection | MediaConnection
): connection is DataConnection {
  return connection.type === 'data'
}

/**
 * isMediaConnection
 */
export function isMC(
  connection: DataConnection | MediaConnection
): connection is MediaConnection {
  return connection.type === 'media'
}

/**
 * @TODO: 判断需要更严格, 如添加唯一标识
 */
export function isMessageIns(msg: unknown): msg is MessageIns {
  return (
    !!msg &&
    ['text', 'image', 'audio', 'video'].includes((msg as MessageIns).type)
  )
}
