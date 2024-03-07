import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import type { AudioMessageIns, VideoMessageIns } from '../../type'

export function MediaMessageElem(message: AudioMessageIns | VideoMessageIns) {
  const { value: mediaSrc, src } = message
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <video
        src={mediaSrc}
        width={240}
        height={120}
        controls
        autoPlay={false}
        style={{
          width: 240,
          height: 120,
        }}
      />
    </MessageWrapperWithRole>
  )
}
