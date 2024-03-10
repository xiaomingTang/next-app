import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import { file2DataURL } from '@/app/(default-layout)/color/utils'

import useSWR from 'swr'

import type { AudioMessageIns, VideoMessageIns } from '../../type'

export function MediaMessageElem(message: AudioMessageIns | VideoMessageIns) {
  const { value: file, contentType, size, name, src } = message
  const { data: dataUrl } = useSWR(`${name}-${size}-${contentType}`, () =>
    file2DataURL(file)
  )
  const { peerId } = usePeer()
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
