import { rawTtsMerge } from './tts'
import { uploadToCos } from './cos'
import { ttsOptionParser } from './ttsOptionParser'

import { prisma } from '@/request/prisma'
import { WeightedTaskQueue } from '@/utils/queue'
import { toError } from '@/errors/utils'

import { genePromiseOnce, withStatic } from '@zimi/utils'
import { noop } from 'lodash-es'

import type { Role } from '@/generated-prisma-client'

export type TtsQueueChannelId = 'default' | 'user' | 'admin'

const rawTtsQueue = new WeightedTaskQueue<TtsQueueChannelId>(2)

async function startTts(hash: string) {
  try {
    const updateRes = await prisma.ttsTask.update({
      where: { hash },
      data: {
        status: 'PROCESSING',
      },
    })
    const outputs = await rawTtsMerge(ttsOptionParser.decode(updateRes))
    await Promise.all([
      uploadToCos(outputs.audio, `/public/tmp/${hash}.mp3`),
      // srt 文件失败就失败了吧
      uploadToCos(outputs.srt, `/public/tmp/${hash}.srt`).catch(noop),
    ])
    await prisma.ttsTask.update({
      where: { hash },
      data: {
        status: 'SUCCESS',
      },
    })
  } catch (err) {
    await prisma.ttsTask.update({
      where: { hash },
      data: {
        status: 'FAILED',
        error: toError(err).message,
      },
    })
  }
}

function appendTtsQueue({
  role,
  ttsHash,
}: {
  role?: Role | null
  ttsHash: string
}) {
  let channelId: TtsQueueChannelId = 'default'
  if (!role) {
    channelId = 'default'
  }
  channelId = role === 'ADMIN' ? 'admin' : 'user'
  rawTtsQueue.enqueue(channelId, ttsHash, () => startTts(ttsHash))
}

async function rawInitTtsQueue() {
  rawTtsQueue.registerChannel('default', 1)
  rawTtsQueue.registerChannel('user', 3)
  rawTtsQueue.registerChannel('admin', 10)

  const allTasks = await prisma.ttsTask.findMany({
    where: {
      status: {
        in: ['PENDING', 'PROCESSING'],
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  for (const task of allTasks) {
    const user = !task.userId
      ? null
      : await prisma.user.findUnique({
          where: { id: task.userId },
        })
    appendTtsQueue({
      role: user?.role,
      ttsHash: task.hash,
    })
  }

  return 'inited'
}

export const ttsQueue = withStatic(rawTtsQueue, {
  init: genePromiseOnce(rawInitTtsQueue),
  appendTtsQueue,
})
