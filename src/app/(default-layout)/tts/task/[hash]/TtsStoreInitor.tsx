'use client'

import { useTtsTask } from './store'

import { checkTtsTask, type TtsTaskItem } from '../../server'

import { SA } from '@/errors/utils'

import { useEffect } from 'react'
import useSWR from 'swr'
import { random } from 'lodash-es'

import type { TtsStatus } from '@/generated-prisma-client'

function shouldRefresh(status: TtsStatus) {
  return status === 'PENDING' || status === 'PROCESSING'
}

export function TtsStoreInitor({ task }: { task: TtsTaskItem }) {
  const { hash, status, error } = task

  useEffect(() => {
    useTtsTask.setState({ task })
  }, [task])

  useSWR(
    ['checkTtsTask', hash, status, error],
    async () => {
      if (!shouldRefresh(status)) {
        return { status, error }
      }
      const res = await checkTtsTask({ hash }).then(SA.decode)
      if (res.status !== status || res.error !== error) {
        useTtsTask.setState({
          task: {
            ...task,
            status: res.status,
            error: res.error,
          },
        })
      }
      return res
    },
    {
      refreshInterval: (lastData) => {
        // 初始加载时 lastData 可能为 undefined
        if (!lastData || shouldRefresh(lastData.status)) {
          // 随机间隔 1-3 秒
          return random(1000, 3000, false)
        }
        return 0
      },
      shouldRetryOnError: false,
    }
  )

  return null
}
