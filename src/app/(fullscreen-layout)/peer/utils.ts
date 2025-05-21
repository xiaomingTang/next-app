import { exclusiveCallbacks } from '@/utils/function'

import { customAlphabet } from 'nanoid'

import type { DataConnection, MediaConnection, Peer } from 'peerjs'
import type { Message } from './type'

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

const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const random = customAlphabet(alphabet, 12)

export const peerIds = {
  peerId: () => random(),
  messageId: (_message: Omit<Message, 'id'>) => random(),
}

export const peerWaitUntil = {
  peerOpen(peer: Peer) {
    return new Promise<void>((resolve, reject) => {
      if (peer.open) {
        resolve()
        return
      }
      exclusiveCallbacks(peer, [
        ['open', () => resolve()],
        ['error', (err: Error) => reject(err)],
        ['disconnected', () => reject(new Error('peer disconnected'))],
        ['close', () => reject(new Error('peer closed'))],
      ])
    })
  },
  connectionOpen(connection: DataConnection) {
    return new Promise<void>((resolve, reject) => {
      if (connection.open) {
        resolve()
        return
      }
      exclusiveCallbacks(connection, [
        ['open', () => resolve()],
        ['error', (err: Error) => reject(err)],
        ['close', () => reject(new Error('peer closed'))],
      ])
    })
  },
}
