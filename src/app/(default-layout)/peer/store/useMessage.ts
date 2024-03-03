import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface TextMessageIns {
  id: string
  type: 'text'
  value: string
}

interface ImageMessageIns {
  id: string
  type: 'image'
  value: string
}

interface AudioMessageIns {
  id: string
  type: 'audio'
  value: string
}

interface VideoMessageIns {
  id: string
  type: 'video'
  value: string
}

type MessageIns =
  | TextMessageIns
  | ImageMessageIns
  | AudioMessageIns
  | VideoMessageIns

interface PeerMessageStore {
  messages: Record<string, MessageIns[]>
}

const useRawPeerMessage = create<PeerMessageStore>()(
  immer(() => ({
    messages: {},
  }))
)

export const usePeerMessage = withStatic(useRawPeerMessage, {
  addMessage(key: string, message: MessageIns) {
    useRawPeerMessage.setState((prev) => {
      prev.messages[key] = [...prev.messages[key], message]
    })
  },
  removeMessage(key: string, message: MessageIns) {
    useRawPeerMessage.setState((prev) => {
      prev.messages[key] = [...prev.messages[key]].filter(
        (item) => item.id === message.id
      )
    })
  },
})
