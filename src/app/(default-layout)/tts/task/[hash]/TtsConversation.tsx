import { voices } from '../../constants'

import { dark } from '@/utils/theme'
import Span from '@/components/Span'

import { alpha, Box, colors, Stack, Typography } from '@mui/material'

import type { TtsMergeOption } from '../../utils/tts'

export function TtsConversation({
  conversation,
}: {
  conversation: TtsMergeOption['options'][number]
}) {
  const voiceObj = voices.find((v) => v.voice === conversation.voice)

  return (
    <Box
      sx={{
        backgroundColor: alpha(colors.common.black, 0.1),
        p: 2,
        borderRadius: 1,
        [dark()]: {
          backgroundColor: alpha(colors.common.white, 0.1),
        },
      }}
    >
      <Typography>
        <Span fontWeight='bold'>
          {voiceObj?.name ?? conversation.voice}
          {': '}
        </Span>
        {conversation.text}
      </Typography>
      <Stack
        direction='row'
        spacing={2}
        mt={1}
        sx={{
          fontSize: '0.8em',
          color: 'text.secondary',
        }}
      >
        <Span>音量 {conversation.volume}</Span>
        <Span>语速 {conversation.rate}</Span>
        <Span>声调 {conversation.pitch}</Span>
      </Stack>
    </Box>
  )
}
