import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import Image from 'next/image'

import type { ImageMessageIns } from '../../type'

export function ImageMessageElem(message: ImageMessageIns) {
  const { value: imageSrc, src } = message
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <Image
        src={imageSrc}
        width={240}
        height={240}
        alt='图片加载失败'
        style={{
          borderRadius: '4px',
          overflow: 'hidden',
          objectFit: 'cover',
        }}
      />
    </MessageWrapperWithRole>
  )
}
