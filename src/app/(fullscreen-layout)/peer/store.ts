import { peerWaitUntil } from './utils'
import { peerIds } from './utils'
import { messageManager } from './messageManager'

import { numberFormat } from '@/utils/numberFormat'

import { create } from 'zustand'
import Peer, { util as peerUtil } from 'peerjs'
import toast from 'react-hot-toast'
import { withStatic } from '@zimi/utils'

import type { MediaConnection } from 'peerjs'
import type {
  Message,
  MessageType,
  PayloadMap,
  PeerMember,
  PeerState,
} from './type'

const useRawPeer = create<PeerState>(() => {
  const url = new URL(process.env.NEXT_PUBLIC_PEER_SERVER)
  const secure = url.protocol === 'https:'
  const port = numberFormat(url.port) || (secure ? 443 : 80)
  const peerId = peerIds.peerId()
  const peer = new Peer(peerId, {
    // debug: 3,
    host: url.hostname,
    port,
    secure,
    path: url.pathname,
  })

  if (!peerUtil.supports.audioVideo && !peerUtil.supports.data) {
    toast.error('你的浏览器不支持 WebRTC')
  }

  return {
    peer,
    members: {},
    activeMemberId: null,
  } as PeerState
})

export const usePeer = withStatic(useRawPeer, {
  async connect(peerId: string) {
    const { peer } = useRawPeer.getState()
    await peerWaitUntil.peerOpen(peer)
    const { members: prevMembers } = useRawPeer.getState()
    const newMembers = {
      ...prevMembers,
    }
    if (!newMembers[peerId]) {
      newMembers[peerId] = {
        peerId,
        messages: [],
        status: 'disconnected',
        dc: null,
        mc: null,
        stream: null,
      }
    }
    const prevMember = newMembers[peerId]
    const newMember = {
      ...prevMember,
    }
    if (newMember.status === 'connected') {
      return
    }
    newMember.status = 'connecting'
    newMember.dc = peer.connect(peerId)
    newMembers[peerId] = newMember
    usePeer.setState((prev) => ({
      ...prev,
      members: newMembers,
      activeMemberId: peerId,
    }))
  },
  async send<K extends MessageType>({
    peerId,
    type,
    payload,
    messageId,
  }: {
    peerId?: string
    type: K
    payload: PayloadMap[K]
    /**
     * 如果指定了 messageId，则表示是重发该消息
     */
    messageId?: string
  }) {
    peerId = peerId || usePeer.getState().activeMemberId || ''
    if (!peerId) {
      throw new Error('没有可用的连接')
    }
    const { members, peer } = useRawPeer.getState()
    const member = members[peerId]
    if (!member) {
      throw new Error('没有可用的连接')
    }
    const messageWithoutId: Omit<Message, 'id'> = {
      timestamp: Date.now(),
      from: peer.id,
      to: peerId,
      type,
      payload,
    }
    if (!member?.dc?.open) {
      let errMsg = '连接已关闭'
      if (member.status === 'disconnected') {
        errMsg = '连接已断开'
      } else if (member.status === 'connecting') {
        errMsg = '正在连接中'
      }
      throw new Error(errMsg)
    }
    const message = {
      ...messageWithoutId,
      id: messageId ?? peerIds.messageId(messageWithoutId),
      status: 'pending',
    } as Message
    if (messageId) {
      usePeer.updateMessage(member, message)
    } else {
      usePeer.pushMessage(peerId, message)
    }
    await peerWaitUntil.connectionOpen(member.dc)
    await member.dc.send(await messageManager.encode(message))
    usePeer.updateMessage(peerId, {
      id: message.id,
      status: 'sent',
    })
  },
  async resend({ peerId, messageId }: { peerId?: string; messageId: string }) {
    peerId = peerId || usePeer.getState().activeMemberId || ''
    const { members } = useRawPeer.getState()
    const member = members[peerId]
    if (!member) {
      throw new Error('没有可用的连接')
    }
    const message = member.messages.find((m) => m.id === messageId)
    if (!message) {
      throw new Error('没有找到消息')
    }
    await usePeer.send({
      peerId,
      type: message.type,
      payload: message.payload,
      messageId,
    })
  },
  async callPeer(peerId: string, stream: MediaStream) {
    const { members, peer } = useRawPeer.getState()
    if (!members[peerId]) {
      members[peerId] = {
        peerId,
        messages: [],
        status: 'disconnected',
        dc: null,
        mc: null,
        stream: null,
      }
    }
    const member = members[peerId]
    if (!member.mc?.open) {
      let errMsg = '连接已关闭'
      if (member.status === 'disconnected') {
        errMsg = '连接已断开'
      } else if (member.status === 'connecting') {
        errMsg = '正在连接中'
      }
      throw new Error(errMsg)
    }
    member.status = 'connecting'
    await peerWaitUntil.peerOpen(peer)
    member.mc = peer.call(peerId, stream)
    member.mc.once('stream', (stream) => {
      member.stream = stream
      member.status = 'connected'
    })
    member.mc.once('close', () => {
      member.status = 'disconnected'
      member.mc = null
      member.stream = null
    })
    member.mc.once('error', (err) => {
      member.status = 'disconnected'
      member.mc = null
      member.stream = null
      console.error('peer call error', err)
    })
  },
  answer(connection: MediaConnection, stream: MediaStream) {
    const { members } = useRawPeer.getState()
    const peerId = connection.peer
    if (!members[peerId]) {
      members[peerId] = {
        peerId,
        messages: [],
        status: 'disconnected',
        dc: null,
        mc: null,
        stream: null,
      }
    }
    const member = members[peerId]
    if (!member.mc?.open) {
      let errMsg = '连接已关闭'
      if (member.status === 'disconnected') {
        errMsg = '连接已断开'
      } else if (member.status === 'connecting') {
        errMsg = '正在连接中'
      }
      throw new Error(errMsg)
    }
    member.status = 'connecting'
    member.mc = connection
    member.mc.answer(stream)
    member.mc.once('stream', (stream) => {
      member.stream = stream
      member.status = 'connected'
    })
    member.mc.once('close', () => {
      member.status = 'disconnected'
      member.mc = null
      member.stream = null
    })
    member.mc.once('error', (err) => {
      member.status = 'disconnected'
      member.mc = null
      member.stream = null
      console.error('peer call error', err)
    })
  },
  updateMember(
    member: Partial<PeerMember> & Pick<PeerMember, 'peerId'>,
    setter?: (state: PeerMember) => PeerMember
  ) {
    useRawPeer.setState((prev) => {
      const { members } = prev
      if (!member) {
        console.error('没有找到成员', member)
        return prev
      }
      const peerId = typeof member === 'string' ? member : member.peerId
      const memberInfo = members[peerId]
      if (!memberInfo) {
        console.error('没有找到成员', member)
        return prev
      }
      if (setter) {
        member = setter(memberInfo)
      }
      return {
        ...prev,
        members: {
          ...members,
          [peerId]: {
            ...memberInfo,
            ...member,
          },
        },
      }
    })
  },
  updateMessage(
    member: string | Pick<PeerMember, 'peerId'>,
    message: Partial<Message> & Pick<Message, 'id'>,
    setter?: (state: Message) => Message
  ) {
    useRawPeer.setState((prev) => {
      const { members } = prev
      if (!member) {
        console.error('没有找到成员', member)
        return prev
      }
      const peerId = typeof member === 'string' ? member : member.peerId
      const memberInfo = members[peerId]
      if (!memberInfo) {
        console.error('没有找到成员', member)
        return prev
      }
      const messageIndex = memberInfo.messages.findIndex(
        (m) => m.id === message.id
      )
      const prevMessage = memberInfo.messages[messageIndex]
      if (!prevMessage) {
        console.error('没有找到消息', message)
        return prev
      }
      const newMessage: Message = setter
        ? setter(prevMessage)
        : Object.assign({}, prevMessage, message)
      return {
        ...prev,
        members: {
          ...members,
          [peerId]: {
            ...memberInfo,
            messages: [
              ...memberInfo.messages.slice(0, messageIndex),
              newMessage,
              ...memberInfo.messages.slice(messageIndex + 1),
            ],
          },
        },
      }
    })
  },
  pushMessage(member: string | Pick<PeerMember, 'peerId'>, message: Message) {
    useRawPeer.setState((prev) => {
      const { members } = prev
      if (!member) {
        console.error('没有找到成员', member)
        return prev
      }
      const peerId = typeof member === 'string' ? member : member.peerId
      const memberInfo = members[peerId]
      if (!memberInfo) {
        console.error('没有找到成员', member)
        return prev
      }
      const messageIndex = memberInfo.messages.findIndex(
        (m) => m.id === message.id
      )
      let newMessages = [...memberInfo.messages]
      if (messageIndex === -1) {
        newMessages = [...newMessages, message]
      } else {
        newMessages = [
          ...newMessages.slice(0, messageIndex),
          message,
          ...newMessages.slice(messageIndex + 1),
        ]
      }
      return {
        ...prev,
        members: {
          ...members,
          [peerId]: {
            ...memberInfo,
            messages: newMessages,
          },
        },
      }
    })
  },
  useActiveMember() {
    return useRawPeer((state) => state.members[state.activeMemberId ?? ''])
  },
})
