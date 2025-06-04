/*
 * TTS任务详情页面
 * 展示任务详细信息、进度、音频播放等
 * 数据通过server action获取，UI使用MUI
 */
'use client'

import { StatusElem } from './StatusElem'

import { getTtsTask } from '../server'
import { voices } from '../constants'
import { getCdnUrl } from '../../upload/utils/getCdnUrl'

import { SA, toError } from '@/errors/utils'
import { Delay } from '@/components/Delay'
import { dark } from '@/utils/theme'
import Anchor from '@/components/Anchor'
import { useUser } from '@/user'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  alpha,
  colors,
  Stack,
} from '@mui/material'
import useSWR from 'swr'

import type { TtsMergeOption } from '../utils/tts'

export default function ViewTtsTaskPage() {
  const user = useUser()
  const hash = useParams<{ hash: string }>()?.hash
  const {
    data: task,
    error: rawError,
    isValidating: loading,
  } = useSWR(`getTtsTask-${hash}`, async () =>
    !hash ? null : getTtsTask({ hash }).then(SA.decode)
  )
  const error = useMemo(() => {
    if (rawError) {
      return toError(rawError)
    }
    if (task?.error) {
      return new Error(task.error)
    }
    return null
  }, [rawError, task?.error])

  const taskConfig = useMemo(
    () =>
      !task?.options ? null : (JSON.parse(task.options) as TtsMergeOption),
    [task?.options]
  )

  const audioUrl = useMemo(() => {
    if (!task?.hash) {
      return null
    }
    return getCdnUrl({ key: `/tmp/${task.hash}.mp3` }).href
  }, [task?.hash])

  const moreActionElem = (
    <Typography component='span' sx={{ color: 'text.secondary' }}>
      <Typography component='span' sx={{ mx: 1 }}>
        {'你还可以'}
      </Typography>
      <Anchor href='/tts/tasks'>返回列表</Anchor>
      {(!!user.id ||
        task?.status === 'SUCCESS' ||
        task?.status === 'FAILED') && (
        <>
          {' 或者 '}
          <Anchor href='/tts'>再新建一个任务</Anchor>
        </>
      )}
    </Typography>
  )

  return (
    <Stack direction='column' spacing={1}>
      <Typography variant='h5' sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        TTS任务详情
      </Typography>
      {!task && error && (
        <Typography color='error'>
          {error.message}
          {moreActionElem}
        </Typography>
      )}
      {task && (
        <>
          <Typography>
            此任务状态：
            <StatusElem status={task.status} />
            {moreActionElem}
          </Typography>
          {task.error && <Typography color='error'>{task.error}</Typography>}
          {taskConfig?.options && (
            <>
              <Divider />
              <Typography>以下是任务详情</Typography>
            </>
          )}
          {taskConfig?.options.map((item, idx) => {
            const voiceObj = voices.find((v) => v.voice === item.voice)
            return (
              <Box
                key={idx}
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
                  <Typography component='span' fontWeight='bold'>
                    {voiceObj?.name ?? item.voice}
                    {': '}
                  </Typography>
                  {item.text}
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
                  <Typography component='span'>音量 {item.volume}</Typography>
                  <Typography component='span'>语速 {item.rate}</Typography>
                  <Typography component='span'>声调 {item.pitch}</Typography>
                </Stack>
              </Box>
            )
          })}
          {audioUrl && (
            // 延迟一点时间，立即就去取的话，貌似取不到
            <Delay delayMs={500}>
              <audio src={audioUrl} controls style={{ width: '100%' }} />
            </Delay>
          )}
          {!audioUrl && (
            <Typography color='text.secondary' mt={2}>
              音频不存在
            </Typography>
          )}
        </>
      )}
      {loading && (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight={200}
        >
          <CircularProgress />
        </Box>
      )}
    </Stack>
  )
}
