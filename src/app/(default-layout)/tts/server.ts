'use server'

import { rawTtsMerge } from './utils/tts'
import { uploadToCos } from './utils/cos'

import { SA, toError } from '@/errors/utils'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { prisma } from '@/request/prisma'

import { z } from 'zod'
import { nanoid } from 'nanoid'
import { noop } from 'lodash-es'
import Boom from '@hapi/boom'
import { redirect } from 'next/navigation'

import type { TtsStatus } from '@/generated-prisma-client'
import type { TtsMergeOption } from './utils/tts'

const ttsDto = z.object({
  rate: z.string(),
  volume: z.string(),
  pitch: z.string(),
  deviceId: z.string(),
  texts: z
    .object({
      text: z
        .string()
        .min(1, '文本不能为空')
        .max(300, '单句话长度不能超过300个字符'),
      voice: z.string(),
      rate: z.string().optional(),
      volume: z.string().optional(),
      pitch: z.string().optional(),
    })
    .array()
    .min(1, '至少需要一个文本')
    .max(50, '最多只能处理50个文本'),
})

interface TryStartTtsTaskProps {
  hash: string
  deviceId: string
  options: TtsMergeOption
}

async function tryStartTtsTask(task: TryStartTtsTaskProps): Promise<TtsStatus> {
  const { hash, deviceId, options } = task
  const key = `${hash}.mp3`

  const user = await getSelf().catch(noop)

  if (!user) {
    const theUserTask = await prisma.ttsTask.findFirst({
      where: {
        deviceId,
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
    })
    if (theUserTask) {
      redirect(`/tts/task/${theUserTask.hash}`)
    }

    const curTask = await prisma.ttsTask.findFirst({
      where: {
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
    })

    if (curTask) {
      await prisma.ttsTask.upsert({
        where: { hash },
        update: {},
        create: {
          hash,
          status: 'PENDING',
          options: JSON.stringify(options),
          deviceId,
        },
      })
      return 'PENDING'
    }
  }

  await prisma.ttsTask.upsert({
    where: { hash },
    update: {},
    create: {
      hash,
      status: 'PROCESSING',
      options: JSON.stringify(options),
      deviceId,
      userId: user?.id || null,
    },
  })

  void rawTtsMerge(options)
    .then(async () => {
      await uploadToCos(`./tmp/${key}`, `/tmp/${key}`)
      await prisma.ttsTask.update({
        where: { hash },
        data: {
          status: 'SUCCESS',
        },
      })
    })
    .catch((err) =>
      prisma.ttsTask.update({
        where: { hash },
        data: {
          status: 'FAILED',
          error: toError(err).message,
        },
      })
    )

  return 'PROCESSING'
}

export const tts = SA.encode(
  zf(ttsDto, async (props) => {
    const hash = nanoid(12)
    const key = `${hash}.mp3`
    const rate = props.rate.trim()
    const volume = props.volume.trim()
    const pitch = props.pitch.trim()

    const texts = props.texts.map((text) => ({
      ...text,
      rate: text.rate?.trim() || rate,
      volume: text.volume?.trim() || volume,
      pitch: text.pitch?.trim() || pitch,
    }))

    const status = await tryStartTtsTask({
      hash,
      deviceId: props.deviceId,
      options: {
        options: texts,
        output: `./tmp/${key}`,
        timeoutMs: 1000 * 60 * 5,
      },
    })

    return { key, status }
  })
)

const ttsCheckDto = z.object({
  hash: z.string().min(1, '任务哈希不能为空'),
})

export const checkTtsTask = SA.encode(
  zf(ttsCheckDto, async (props) => {
    const task = await prisma.ttsTask.findUnique({
      where: { hash: props.hash },
    })

    if (!task) {
      throw Boom.notFound('任务不存在')
    }

    if (task.status === 'PENDING') {
      const status = await tryStartTtsTask({
        hash: props.hash,
        deviceId: task.deviceId,
        options: JSON.parse(task.options) as TtsMergeOption,
      })
      return {
        status,
        error: null,
      }
    }

    return {
      status: task.status,
      error: task.error || null,
    }
  })
)
