import { TextMessageElem } from './TextMessageElem'

import { usePeerMessage } from '../../store/useMessage'
import { usePeer } from '../../store/usePeer'

import { dark } from '@/utils/theme'
import { useListen } from '@/hooks/useListen'

import { Box, alpha } from '@mui/material'
import { common } from '@mui/material/colors'
import { useRef } from 'react'

export function MessageViewer() {
  const { peer, activeConnectionInfo } = usePeer()
  const { messages } = usePeerMessage()
  const messageList = messages[activeConnectionInfo?.targetPeerId ?? ''] ?? []
  const containerRef = useRef<HTMLElement>(null)

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
        width: '100%',
        height: '50vh',
        maxHeight: '600px',
        minHeight: '300px',
        p: 2,
        borderRadius: 1,
        overflow: 'auto',
        backgroundColor: alpha(common.black, 0.05),
        [dark()]: {
          backgroundColor: alpha(common.white, 0.05),
        },
      }}
    >
      {messageList.map((item) => {
        switch (item.type) {
          case 'text':
            return <TextMessageElem key={item.id} {...item} />
          default:
            // 新增 "不支持的消息类型" 类型组件
            return (
              <TextMessageElem
                key={item.id}
                {...item}
                type='text'
                value='不支持的消息类型'
              />
            )
        }
      })}
    </Box>
  )
}
