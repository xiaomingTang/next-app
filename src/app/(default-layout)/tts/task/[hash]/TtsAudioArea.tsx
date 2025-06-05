'use client'

import { useTtsTask } from './store'

import { getCdnUrl } from '@/app/(default-layout)/upload/utils/getCdnUrl'
import { Delay } from '@/components/Delay'

import { useMemo } from 'react'
import { Alert, Divider } from '@mui/material'

import type { TtsTaskItem } from '../../server'

export function TtsAudioArea({ task: initTask }: { task: TtsTaskItem }) {
  const task = useTtsTask((state) => state.task) || initTask

  const url = useMemo(
    () => getCdnUrl({ key: `/tmp/${task.hash}.mp3` }).href,
    [task.hash]
  )

  if (task.status === 'SUCCESS') {
    // 任务成功，直接返回音频
    return (
      <Delay delayMs={1000}>
        <Divider />
        <Alert severity='warning'>
          请尽快下载音频文件，因为历史记录及文件会不定期清理。
        </Alert>
        <audio src={url} controls style={{ width: '100%' }} />
      </Delay>
    )
  }

  return null
}
