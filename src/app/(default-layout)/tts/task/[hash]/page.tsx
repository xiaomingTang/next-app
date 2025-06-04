import { TtsStatusIndicator } from './TtsStatusIndicator'
import { TtsStoreInitor } from './TtsStoreInitor'
import { TtsAudioArea } from './TtsAudioArea'
import { TtsConversation } from './TtsConversation'

import { getTtsTask } from '../../server'

import { seo } from '@/utils/seo'
import { SA } from '@/errors/utils'
import Anchor from '@/components/Anchor'
import Span from '@/components/Span'

import { Divider, Stack, Typography } from '@mui/material'

export const metadata = seo.defaults({
  title: '语音合成任务详情',
  keywords: 'tts,语音合成,文字转语音,文本转语音',
})

interface Params {
  hash: string
}

interface Props {
  params: Promise<Params>
}

export default async function Index(props: Props) {
  const params = await props.params

  const { hash } = params

  const task = await getTtsTask({ hash }).then(SA.decode)

  return (
    <Stack direction='column' spacing={2}>
      <TtsStoreInitor task={task} />
      <Typography variant='h5' sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        TTS任务详情
      </Typography>
      <Typography>
        <TtsStatusIndicator task={task} />
      </Typography>
      <Typography sx={{ color: 'text.secondary' }}>
        <Span>{'你还可以 '}</Span>
        <Anchor href='/tts/tasks'>返回任务列表</Anchor>
        {' 或者 '}
        <Anchor href='/tts'>再新建一个任务</Anchor>
      </Typography>
      <Divider />
      <Typography>以下是任务详情</Typography>
      {task.options.options.map((item, idx) => (
        <TtsConversation key={idx} conversation={item} />
      ))}
      <TtsAudioArea task={task} />
    </Stack>
  )
}
