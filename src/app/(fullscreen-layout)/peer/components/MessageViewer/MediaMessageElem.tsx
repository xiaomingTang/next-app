import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import type { AudioMessageIns, VideoMessageIns } from '../../type'

export function MediaMessageElem(message: AudioMessageIns | VideoMessageIns) {
  const { value: mediaSrc, src } = message
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'
  const height = message.type === 'video' ? 120 : 60

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <video
        src={mediaSrc}
        width={240}
        height={height}
        controls
        autoPlay={false}
        style={{
          width: 240,
          height,
          userSelect: 'none',
        }}
      />
    </MessageWrapperWithRole>
  )
}
