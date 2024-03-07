import { MessageWrapperWithRole } from './MessageWrapper'

import { usePeer } from '../../store/usePeer'

import { dark } from '@/utils/theme'

import { Typography, alpha } from '@mui/material'
import { common, blue } from '@mui/material/colors'

import type { TextMessageIns } from '../../type'

type Props = Omit<TextMessageIns, 'value'> & {
  value: React.ReactNode
}

export function TextMessageInnerElem(message: Props) {
  const { value: text, src } = message
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'

  if (role === 'guest') {
    return (
      <Typography
        component='div'
        sx={{
          p: 1,
          borderRadius: 1,
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
    )
  }

  return (
    <Typography
      component='div'
      sx={{
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        color: alpha(common.white, 0.9),
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
  )
}

export function TextMessageElem(message: Props) {
  const { src } = message
  const { peerId } = usePeer()
  const role = src === peerId ? 'master' : 'guest'

  return (
    <MessageWrapperWithRole role={role} message={message}>
      <TextMessageInnerElem {...message} />
    </MessageWrapperWithRole>
  )
}
