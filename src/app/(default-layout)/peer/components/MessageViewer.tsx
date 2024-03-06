import { usePeerMessage } from '../store/useMessage'
import { usePeer } from '../store/usePeer'

import { dark } from '@/utils/theme'

import { Box, Typography, alpha } from '@mui/material'
import { common, blue } from '@mui/material/colors'

function Text({ text, role }: { text: string; role: 'master' | 'guest' }) {
  if (role === 'guest') {
    return (
      <Box sx={{ py: 1 }}>
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
        '&:after': {
          content: '" "',
          display: 'block',
          height: 0,
          clear: 'both',
          visibility: 'hidden',
        },
      }}
    >
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
    </Box>
  )
}

export function MessageViewer() {
  const { peer, activeConnectionInfo } = usePeer()
  const { messages } = usePeerMessage()
  const messageList = messages[activeConnectionInfo?.targetPeerId ?? ''] ?? []

  usePeerMessage.useInit(peer)

  return (
    <Box
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
      {messageList.map((item, idx) => (
        <Text
          key={item.id}
          text={item.value}
          role={idx % 2 ? 'master' : 'guest'}
        />
      ))}
    </Box>
  )
}
