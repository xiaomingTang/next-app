import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store'

import { ImageWithState } from '@/components/ImageWithState'
import { useFile2URL } from '@/utils/file'

import type { ImageMessage } from '../../type'

export function ImageMessageElem(message: ImageMessage) {
  const { payload: file, from: src } = message
  const dataUrl = useFile2URL(file)
  const peerId = usePeer((state) => state.peer.id)
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <ImageWithState
        src={dataUrl}
        preview
        width={240}
        height={120}
        alt={file.name}
        style={{
          borderRadius: '4px',
          overflow: 'hidden',
          objectFit: 'cover',
          width: 240,
          height: 120,
          userSelect: 'none',
        }}
      />
    </MessageWrapperWithRole>
  )
}
