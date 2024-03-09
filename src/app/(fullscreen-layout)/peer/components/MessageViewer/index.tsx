import 'react-photo-view/dist/react-photo-view.css'

import { TextMessageElem } from './TextMessageElem'
import { ImageMessageElem } from './ImageMessageElem'
import { MediaMessageElem } from './MediaMessageElem'
import { FileMessageElem } from './FileMessageElem'
import { VideoCallElem } from './VideoCallElem'

import { usePeerMessage } from '../../store/useMessage'
import { usePeer } from '../../store/usePeer'

import { dark } from '@/utils/theme'
import { useListen } from '@/hooks/useListen'
import { useInjectHistory } from '@/hooks/useInjectHistory'
import { assertNever } from '@/utils/function'

import { Box, alpha } from '@mui/material'
import { common } from '@mui/material/colors'
import { useRef, useState } from 'react'
import { PhotoProvider } from 'react-photo-view'

export function MessageViewer() {
  const { peer, activeConnectionInfo } = usePeer()
  const { messages } = usePeerMessage()
  const messageList = messages[activeConnectionInfo?.targetPeerId ?? ''] ?? []
  const containerRef = useRef<HTMLElement>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const closeRef = useRef<() => void>()

  useInjectHistory(previewVisible, () => {
    closeRef.current?.()
  })

  usePeerMessage.useInit(peer)

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
            default:
              assertNever(item)
              return <></>
          }
        })}
      </PhotoProvider>
    </Box>
  )
}
