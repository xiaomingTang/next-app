'use client'

import { useTtsTask } from './store'

import { getCdnUrl } from '@/app/(default-layout)/upload/utils/getCdnUrl'
import { Delay } from '@/components/Delay'

import { useMemo } from 'react'

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
        <audio src={url} controls style={{ width: '100%' }} />
      </Delay>
    )
  }

  return null
}
