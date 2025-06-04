'use client'

import { useTtsTask } from './store'

import { StatusElem } from '../../components/StatusElem'

import Span from '@/components/Span'

import type { TtsTaskItem } from '../../server'

export function TtsStatusIndicator({ task: initTask }: { task: TtsTaskItem }) {
  const task = useTtsTask((state) => state.task) || initTask
  const { status, error } = task

  return (
    <Span>
      此任务状态：
      <StatusElem status={status} />
      {error && (
        <Span color='error' sx={{ ml: 1 }}>
          错误信息：{error}
        </Span>
      )}
    </Span>
  )
}
