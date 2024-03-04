import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import type { MessageIns } from '../constants'

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
      prev.messages[key] = [...(prev.messages[key] ?? []), message]
    })
  },
  removeMessage(key: string, message: MessageIns) {
    useRawPeerMessage.setState((prev) => {
      prev.messages[key] = [...(prev.messages[key] ?? [])].filter(
        (item) => item.id === message.id
      )
    })
  },
})
