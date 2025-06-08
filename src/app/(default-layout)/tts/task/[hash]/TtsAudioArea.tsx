'use client'

import { useTtsTask } from './store'

import { getCdnUrl } from '@/app/(default-layout)/upload/utils/getCdnUrl'
import { Delay } from '@/components/Delay'
import Anchor from '@/components/Anchor'
import { useNowDate } from '@/hooks/useNow'

import { useMemo } from 'react'
import { Alert, Button, ButtonGroup, Divider } from '@mui/material'

import type { TtsTaskItem } from '../../server'

export function TtsAudioArea({ task: initTask }: { task: TtsTaskItem }) {
  const task = useTtsTask((state) => state.task) || initTask
  const now = useNowDate(5000)
  const basename = now.toISOString().replace(/[-:]/g, '').slice(0, -5)

  const audioUrl = useMemo(
    () => getCdnUrl({ key: `/public/tmp/${task.hash}.mp3` }).href,
    [task.hash]
  )

  const srtUrl = useMemo(
    () => getCdnUrl({ key: `/public/tmp/${task.hash}.srt` }).href,
    [task.hash]
  )

  if (task.status === 'SUCCESS') {
    // 任务成功，直接返回音频
    return (
      <Delay delayMs={500}>
        <Divider />
        <Alert severity='warning'>
          请尽快下载相关文件，因为历史记录及文件会不定期清理。
        </Alert>
        <ButtonGroup variant='text'>
          <Button
            LinkComponent={Anchor}
            href={audioUrl}
            download={`${basename}.mp3`}
            target='_blank'
          >
            mp3 文件
          </Button>
          <Button
            LinkComponent={Anchor}
            href={srtUrl}
            download={`${basename}.srt`}
            target='_blank'
          >
            srt 文件
          </Button>
        </ButtonGroup>
        <audio src={audioUrl} controls style={{ width: '100%' }} />
      </Delay>
    )
  }

  return null
}
