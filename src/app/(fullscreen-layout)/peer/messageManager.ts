import { usePeer } from './store'

import type { BaseMessage, Message } from './type'

export interface FileLike {
  name: string
  size: number
  type: string
  bytes: Uint8Array
}

export type MediumMessage =
  | BaseMessage<'text'>
  | BaseMessage<'image', FileLike>
  | BaseMessage<'audio', FileLike>
  | BaseMessage<'video', FileLike>
  | BaseMessage<'file', FileLike>
  | BaseMessage<'system'>
  | BaseMessage<'receipt'>
  | BaseMessage<'ping'>

export function isMessage(data: unknown): data is Message {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'from' in data &&
    'to' in data &&
    'type' in data &&
    'payload' in data
  )
}

export function isMessageLike(data: unknown): data is MediumMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'from' in data &&
    'to' in data &&
    'type' in data &&
    'payload' in data
  )
}

export const messageManager = {
  async encode(data: Message): Promise<MediumMessage> {
    switch (data.type) {
      case 'text':
      case 'system':
      case 'receipt':
      case 'ping':
        return data
      default:
        break
    }
    const { payload } = data
    const newPayload: FileLike = {
      name: payload.name,
      size: payload.size,
      type: payload.type,
      bytes: new Uint8Array(await payload.arrayBuffer()),
    }
    return {
      ...data,
      payload: newPayload,
    }
  },
  async decode(data: unknown): Promise<Message> {
    if (!isMessageLike(data)) {
      console.error('Invalid message format', data)
      throw new Error('Invalid message format')
    }
    switch (data.type) {
      case 'text':
      case 'system':
      case 'receipt':
      case 'ping':
        return data
      default:
        break
    }
    const newPayload = new File([data.payload.bytes], data.payload.name, {
      type: data.payload.type,
    })
    return {
      ...data,
      payload: newPayload,
    }
  },
  async handler(e: unknown) {
    console.log('messageManager.handler', e)
    if (!isMessageLike(e)) {
      console.error('Invalid message format', e)
      return
    }
    const data = await messageManager.decode(e)
    if (data.type === 'ping') {
      return
    }
    if (data.type === 'receipt') {
      const { receiptForId, value } = data.payload
      usePeer.updateMessage(data.from, {
        id: receiptForId,
        status: value,
      })
      return
    }
    usePeer.pushMessage(data.from, {
      ...data,
      timestamp: Date.now(),
      status: 'received',
    })
    void usePeer.send({
      peerId: data.from,
      type: 'receipt',
      payload: {
        receiptForId: data.id,
        value: 'received',
      },
    })
  },
}
