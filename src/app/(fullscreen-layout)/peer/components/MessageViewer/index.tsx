import 'react-photo-view/dist/react-photo-view.css'

import { TextMessageElem } from './TextMessageElem'
import { ImageMessageElem } from './ImageMessageElem'
import { MediaMessageElem } from './MediaMessageElem'
import { FileMessageElem } from './FileMessageElem'
import { VideoCallElem } from './VideoCallElem'

import { usePeer } from '../../store'

import { dark } from '@/utils/theme'
import { useListen } from '@/hooks/useListen'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { assertNever } from '@/utils/function'

import { Box, alpha } from '@mui/material'
import { common } from '@mui/material/colors'
import { useRef, useState } from 'react'
import { PhotoProvider } from 'react-photo-view'
import { noop } from 'lodash-es'

export function MessageViewer() {
  const messageList = usePeer.useActiveMember()?.messages ?? []
  const containerRef = useRef<HTMLElement>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const closeRef = useRef(noop)

  useInjectHistory(previewVisible, () => {
    closeRef.current()
  })

  useListen(messageList, () => {
    const container = containerRef.current
    if (container && messageList.length > 0) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    }
  })

  return (
    <Box
      ref={containerRef}
      className='scrollbar-thin'
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        flexShrink: 1,
        p: 2,
        borderRadius: 1,
        overflow: 'auto',
        backgroundColor: alpha(common.black, 0.05),
        [dark()]: {
          backgroundColor: alpha(common.white, 0.05),
        },
      }}
    >
      <VideoCallElem />
      <PhotoProvider
        onVisibleChange={(visible) => {
          setPreviewVisible(visible)
        }}
        toolbarRender={({ onClose }) => {
          closeRef.current = onClose
          return <></>
        }}
      >
        {messageList.map((item) => {
          switch (item.type) {
            case 'text':
              return <TextMessageElem key={item.id} {...item} />
            case 'image':
              return <ImageMessageElem key={item.id} {...item} />
            case 'audio':
            case 'video':
              return <MediaMessageElem key={item.id} {...item} />
            case 'file':
              return <FileMessageElem key={item.id} {...item} />
            // 暂不处理 system 消息
            case 'system':
            case 'receipt':
            case 'ping':
              return <></>
            default:
              assertNever(item)
              return <></>
          }
        })}
      </PhotoProvider>
    </Box>
  )
}
