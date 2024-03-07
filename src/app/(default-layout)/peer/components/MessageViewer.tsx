import { usePeerMessage } from '../store/useMessage'
import { usePeer } from '../store/usePeer'

import { dark } from '@/utils/theme'
import { formatTime } from '@/utils/formatTime'
import { useListen } from '@/hooks/useListen'

import { Box, Typography, alpha } from '@mui/material'
import { common, blue } from '@mui/material/colors'
import { useRef } from 'react'

import type { TextMessageIns } from '../type'

const clearBoth = (
  <Box
    sx={{
      width: '100%',
      height: 0,
      clear: 'both',
      visibility: 'hidden',
    }}
  />
)

function Text({ value: text, date, src }: TextMessageIns) {
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'
  if (role === 'guest') {
    return (
      <Box sx={{ py: 1 }}>
        <Typography
          sx={{
            fontSize: '11px',
            ml: '4px',
            mb: 1,
            color: alpha(common.black, 0.6),
            [dark()]: {
              color: alpha(common.white, 0.5),
            },
          }}
        >
          {formatTime(date)}
        </Typography>
        <Typography
          sx={{
            display: 'inline-block',
            minWidth: '2em',
            maxWidth: '90%',
            p: 1,
            borderRadius: 1,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            border: '1px solid',
            boxShadow: `0 0 8px ${alpha(common.black, 0.1)}`,
            borderColor: alpha(common.black, 0.1),
            backgroundColor: alpha(common.white, 0.75),
            [dark()]: {
              boxShadow: `0 0 8px ${alpha(common.white, 0.05)}`,
              borderColor: alpha(common.white, 0.05),
              backgroundColor: alpha(common.black, 0.25),
            },
          }}
        >
          {text}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        py: 1,
      }}
    >
      <Typography
        sx={{
          float: 'right',
          fontSize: '11px',
          mr: '4px',
          mb: 1,
          color: alpha(common.black, 0.6),
          [dark()]: {
            color: alpha(common.white, 0.5),
          },
        }}
      >
        {formatTime(date)}
      </Typography>
      {clearBoth}
      <Typography
        sx={{
          float: 'right',
          display: 'inline-block',
          minWidth: '2em',
          maxWidth: '90%',
          p: 1,
          borderRadius: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          color: alpha(common.white, 0.9),
          border: '1px solid',
          boxShadow: `0 0 8px ${alpha(blue[700], 0.5)}`,
          borderColor: alpha(blue[700], 0.5),
          backgroundColor: alpha(blue[700], 0.75),
          [dark()]: {
            color: alpha(common.black, 0.75),
            boxShadow: `0 0 8px ${alpha(common.white, 0.15)}`,
            borderColor: alpha(common.white, 0.15),
            backgroundColor: alpha(blue[200], 0.75),
          },
        }}
      >
        {text}
      </Typography>
      {clearBoth}
    </Box>
  )
}

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
            return <Text key={item.id} {...item} />
          default:
            // 新增 "不支持的消息类型" 类型组件
            return (
              <Text
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
