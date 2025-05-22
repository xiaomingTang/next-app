import { peerWaitUntil } from './utils'
import { peerIds } from './utils'
import { messageManager } from './messageManager'
import { getStunCredentials } from './server'

import { numberFormat } from '@/utils/numberFormat'
import { SA, toError } from '@/errors/utils'
import { exclusiveCallbacks } from '@/utils/function'

import { create } from 'zustand'
import Peer, { util as peerUtil } from 'peerjs'
import { genePromiseOnce, withStatic } from '@zimi/utils'

import type { MediaConnection } from 'peerjs'
import type {
  Message,
  MessageType,
  PayloadMap,
  PeerMember,
  PeerState,
} from './type'

const useRawPeer = create<PeerState>(() => ({
  peer: null,
  members: {},
  activeMemberId: null,
}))

export const usePeer = withStatic(useRawPeer, {
  init: genePromiseOnce(async () => {
    const { peer } = useRawPeer.getState()
    if (peer) {
      return peer
    }
    if (!peerUtil.supports.audioVideo && !peerUtil.supports.data) {
      throw new Error('你的浏览器不支持 WebRTC')
    }
    console.log('peer init')
    const res = await getStunCredentials().then(SA.decode)
    console.log('stun: ', res)
    console.log(
      `turnutils_uclient -u ${res.username} -w ${res.password} -r 16px.cc 16px.cc`
    )
    const peerUrl = new URL(process.env.NEXT_PUBLIC_PEER_SERVER)
    const secure = peerUrl.protocol === 'https:'
    const port = numberFormat(peerUrl.port) || (secure ? 443 : 80)
    const peerId = peerIds.peerId()
    const newPeer = new Peer(peerId, {
      // debug: 3,
      host: peerUrl.hostname,
      port,
      secure,
      path: peerUrl.pathname,
      config: {
        iceServers: [
          {
            urls: res.stun,
          },
          {
            urls: res.turn,
            username: res.username,
            credential: res.password,
          },
        ],
      },
    })
    await peerWaitUntil.peerOpen(newPeer)
    useRawPeer.setState({
      peer: newPeer,
    })
    return newPeer
  }),
  async connect(peerId: string) {
    const peer = await usePeer.init()
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
      }
    }
    const prevMember = newMembers[peerId]
    const newMember = {
      ...prevMember,
    }
    if (newMember.dc?.open) {
      usePeer.updateMember({
        peerId,
        status: 'connected',
      })
      return
    }
    newMember.status = 'connecting'
    const dc = peer.connect(peerId)
    newMember.dc = dc
    newMembers[peerId] = newMember
    usePeer.setState((prev) => ({
      ...prev,
      members: newMembers,
      activeMemberId: peerId,
    }))
    return new Promise<void>((resolve, reject) => {
      exclusiveCallbacks(dc, [
        [
          'open',
          () => {
            resolve()
          },
        ],
        [
          'error',
          (err: Error) => {
            reject(toError(err))
          },
        ],
        [
          'close',
          () => {
            reject(new Error('连接已关闭'))
          },
        ],
      ])
    })
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
    const peer = await usePeer.init()
    const { members } = useRawPeer.getState()
    const member = members[peerId]
    if (!peer) {
      throw new Error('连接尚未初始化')
    }
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
    const peer = await usePeer.init()
    const { members: prevMembers } = useRawPeer.getState()
    if (!prevMembers[peerId]) {
      throw new Error('没有找到对方的连接')
    }
    const mc = peer.call(peerId, stream)
    usePeer.updateMember({
      peerId,
      mc,
      status: 'connecting',
    })
    mc.once('stream', () => {
      usePeer.updateMember({
        peerId,
        status: 'connected',
      })
    })
    mc.once('close', () => {
      usePeer.updateMember({
        peerId,
        mc: null,
        status: 'disconnected',
      })
    })
    mc.once('error', (err) => {
      usePeer.updateMember({
        peerId,
        mc: null,
        status: 'disconnected',
      })
      console.error('peer call error', err)
    })
  },
  async answer(mc: MediaConnection, stream: MediaStream) {
    await usePeer.init()
    const peerId = mc.peer
    const { members: prevMembers } = useRawPeer.getState()
    if (!prevMembers[peerId]) {
      throw new Error('没有找到对方的连接')
    }
    usePeer.updateMember({
      peerId,
      mc,
      status: 'connecting',
    })
    mc.answer(stream)
    mc.once('stream', () => {
      usePeer.updateMember({
        peerId,
        status: 'connected',
      })
    })
    mc.once('close', () => {
      usePeer.updateMember({
        peerId,
        mc: null,
        status: 'disconnected',
      })
    })
    mc.once('error', (err) => {
      usePeer.updateMember({
        peerId,
        mc: null,
        status: 'disconnected',
      })
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
  useActiveMember(): PeerMember | undefined {
    return useRawPeer((state) => state.members[state.activeMemberId ?? ''])
  },
})
