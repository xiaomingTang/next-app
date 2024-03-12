import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import { ImageWithState } from '@/components/ImageWithState'
import { useFile2URL } from '@/utils/file'

import type { ImageMessageIns } from '../../type'

export function ImageMessageElem(message: ImageMessageIns) {
  const { value: file, name, src } = message
  const dataUrl = useFile2URL(file)
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <ImageWithState
        src={dataUrl}
        preview
        width={240}
        height={120}
        alt={name}
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
