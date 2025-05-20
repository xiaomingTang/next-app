import { usePeer } from '../../store'

import { dark } from '@/utils/theme'
import { formatTime } from '@/utils/transformer'
import { cat } from '@/errors/catchAndToast'
import { Delay } from '@/components/Delay'

import { Box, CircularProgress, IconButton, alpha } from '@mui/material'
import { common } from '@mui/material/colors'
import ReplayIcon from '@mui/icons-material/Replay'
import CheckIcon from '@mui/icons-material/Check'

import type { Message } from '../../type'
import type { BoxProps } from '@mui/material'

function MessageStatus({
  role,
  message,
}: {
  role: 'master' | 'guest'
  message: Omit<Message, 'payload'>
}) {
  const isSelf = role === 'master'
  const { status } = message
  if (!isSelf) {
    return <></>
  }
  if (status === 'failed') {
    return (
      <IconButton
        color='error'
        size='small'
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          transform: 'translateX(-100%)',
        }}
        onClick={cat(() =>
          usePeer.resend({
            peerId: message.to,
            messageId: message.id,
          })
        )}
      >
        <ReplayIcon />
      </IconButton>
    )
  }
  if (status === 'received') {
    return (
      <CheckIcon
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '-0.5em',
          transform: 'translateX(-100%)',
          color: 'success.main',
          opacity: 0.6,
          fontSize: '0.9em',
        }}
      />
    )
  }
  if (status === 'sent') {
    return (
      <Delay delayMs={500}>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '-0.5em',
            display: 'inline-block',
            transform: 'translateX(-100%)',
            color: 'success.main',
            opacity: 0.6,
            fontSize: '0.9em',
          }}
        >
          <CircularProgress size='0.9em' color='inherit' />
        </Box>
      </Delay>
    )
  }
}

export function MessageWrapperWithRole({
  children,
  role,
  message,
  sx,
  ...restProps
}: BoxProps & {
  role: 'master' | 'guest'
  message: Omit<Message, 'payload'>
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: role === 'master' ? 'flex-end' : 'flex-start',
        justifyContent: 'flex-start',
        py: 1,
        ...sx,
      }}
      {...restProps}
    >
      <Box
        sx={{
          fontSize: '11px',
          mb: '4px',
          userSelect: 'none',
          color: alpha(common.black, 0.6),
          [dark()]: {
            color: alpha(common.white, 0.5),
          },
        }}
      >
        {formatTime(message.timestamp)}
      </Box>
      <Box
        sx={{
          position: 'relative',
          minWidth: '2em',
          maxWidth: '90%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        <MessageStatus role={role} message={message} />
        {children}
      </Box>
    </Box>
  )
}
