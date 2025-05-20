import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store'

import { useFile2URL } from '@/utils/file'

import type { AudioMessage, VideoMessage } from '../../type'

export function MediaMessageElem(message: AudioMessage | VideoMessage) {
  const { payload: file, from: src } = message
  const dataUrl = useFile2URL(file)
  const peerId = usePeer((state) => state.peer.id)
  const role = src === peerId ? 'master' : 'guest'
  const height = message.type === 'video' ? 120 : 60

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <video
        src={dataUrl}
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
