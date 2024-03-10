import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import { ImageWithState } from '@/components/ImageWithState'
import { file2DataURL } from '@/app/(default-layout)/color/utils'

import useSWR from 'swr'

import type { ImageMessageIns } from '../../type'

export function ImageMessageElem(message: ImageMessageIns) {
  const { value: file, contentType, size, name, src } = message
  const { data: dataUrl } = useSWR(`${name}-${size}-${contentType}`, () =>
    file2DataURL(file)
  )
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
