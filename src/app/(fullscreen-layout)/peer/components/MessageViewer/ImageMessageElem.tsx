import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import { ImageWithState } from '@/components/ImageWithState'

import type { ImageMessageIns } from '../../type'

export function ImageMessageElem(message: ImageMessageIns) {
  const { value: imageSrc, src } = message
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <ImageWithState
        src={imageSrc}
        preview
        width={240}
        height={120}
        alt='图片加载失败'
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
