import { dark } from '@/utils/theme'
import { formatTime } from '@/utils/formatTime'

import { Box, alpha } from '@mui/material'
import { common } from '@mui/material/colors'

import type { BoxProps } from '@mui/material'
import type { MessageIns } from '../../type'

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

function MessageWrapper({ sx, children, ...restProps }: BoxProps) {
  return (
    <Box sx={{ py: 1, ...sx }} {...restProps}>
      {children}
    </Box>
  )
}

export function MessageWrapperWithRole({
  children,
  role,
  message,
  ...restProps
}: BoxProps & {
  role: 'master' | 'guest'
  message: Pick<MessageIns, 'date'>
}) {
  if (role === 'guest') {
    return (
      <MessageWrapper {...restProps}>
        <Box
          sx={{
            fontSize: '11px',
            ml: '4px',
            mb: 1,
            userSelect: 'none',
            color: alpha(common.black, 0.6),
            [dark()]: {
              color: alpha(common.white, 0.5),
            },
          }}
        >
          {formatTime(message.date)}
        </Box>
        <Box
          sx={{
            display: 'inline-block',
            minWidth: '2em',
            maxWidth: '90%',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {children}
        </Box>
        {clearBoth}
      </MessageWrapper>
    )
  }
  return (
    <MessageWrapper {...restProps}>
      <Box
        sx={{
          float: 'right',
          fontSize: '11px',
          mr: '4px',
          mb: 1,
          userSelect: 'none',
          color: alpha(common.black, 0.6),
          [dark()]: {
            color: alpha(common.white, 0.5),
          },
        }}
      >
        {formatTime(message.date)}
      </Box>
      {clearBoth}
      <Box
        sx={{
          float: 'right',
          display: 'inline-block',
          minWidth: '2em',
          maxWidth: '90%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {children}
      </Box>
      {clearBoth}
    </MessageWrapper>
  )
}
