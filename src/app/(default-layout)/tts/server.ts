'use server'

import { rawTtsMerge } from './utils/tts'
import { uploadToCos } from './utils/cos'

import { SA, toError } from '@/errors/utils'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { prisma } from '@/request/prisma'
import { ensureUser } from '@/user/validate'
import { resolvePath } from '@/utils/url'

import { sendDingGroupMessage } from '@zimi/utils'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { noop } from 'lodash-es'
import Boom from '@hapi/boom'
import { redirect } from 'next/navigation'

import type { SA_RES } from '@/errors/utils'
import type { TtsStatus } from '@/generated-prisma-client'
import type { TtsMergeOption } from './utils/tts'

const globalTtsConfig = {
  enableGuest: process.env.TTS_ENABLE_GUEST,
  enableUser: process.env.TTS_ENABLE_USER,
}

export const getTtsConfig = SA.encode(async () => {
  await getSelf()
  return globalTtsConfig
})

const updateTtsConfigDto = z.object({
  enableGuest: z.boolean(),
  enableUser: z.boolean(),
})

export const updateTtsConfig = SA.encode(
  zf(updateTtsConfigDto, async (props) => {
    ensureUser(await getSelf(), { roles: ['ADMIN'] })
    globalTtsConfig.enableGuest = props.enableGuest
    globalTtsConfig.enableUser = props.enableUser
    return globalTtsConfig
  })
)

const ttsDto = z.object({
  voice: z.string().min(1, '请选择一个语音'),
  rate: z.string(),
  volume: z.string(),
  pitch: z.string(),
  deviceId: z.string(),
  texts: z
    .object({
      text: z
        .string()
        .min(1, '文本不能为空')
        .max(1000, '单句话长度不能超过1000个字符'),
      voice: z.string().optional(),
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

const ttsOption = {
  encode: (arg: TtsMergeOption) => JSON.stringify(arg),
  decode: (arg: { options: string }) =>
    JSON.parse(arg.options) as TtsMergeOption,
}

async function tryStartTtsTask(task: TryStartTtsTaskProps): Promise<TtsStatus> {
  const { hash, deviceId, options } = task

  const user = await getSelf().catch(noop)

  if (!user && !globalTtsConfig.enableGuest) {
    throw Boom.forbidden('访客不允许使用TTS服务')
  }
  if (user && !globalTtsConfig.enableUser) {
    throw Boom.forbidden('普通用户不允许使用TTS服务')
  }

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

    void sendDingGroupMessage({
      accessToken: process.env.DINGTALK_ACCESS_TOKEN,
      secret: process.env.DINGTALK_SECRET,
      data: {
        msgtype: 'actionCard',
        actionCard: {
          title: 'tts 任务已创建',
          text: `tts 任务哈希: ${hash}\n设备ID: ${deviceId}`,
          btnOrientation: '1',
          singleTitle: '修改 tts 权限',
          singleURL: resolvePath('/tts').href,
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
          options: ttsOption.encode(options),
          deviceId,
        },
      })
      return 'PENDING'
    }
  }

  await prisma.ttsTask.upsert({
    where: { hash },
    update: {
      status: 'PROCESSING',
    },
    create: {
      hash,
      status: 'PROCESSING',
      options: ttsOption.encode(options),
      deviceId,
      userId: user?.id || null,
    },
  })

  void rawTtsMerge(options)
    .then(async () => {
      const key = `${hash}.mp3`
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
    /**
     * 任务的唯一标识
     */
    const hash = nanoid(12)
    const voice = props.voice.trim()
    const rate = props.rate.trim()
    const volume = props.volume.trim()
    const pitch = props.pitch.trim()

    const texts = props.texts.map((text) => ({
      ...text,
      voice: text.voice?.trim() || voice,
      rate: text.rate?.trim() || rate,
      volume: text.volume?.trim() || volume,
      pitch: text.pitch?.trim() || pitch,
    }))

    const status = await tryStartTtsTask({
      hash,
      deviceId: props.deviceId,
      options: {
        options: texts,
        output: `./tmp/${hash}.mp3`,
        timeoutMs: 1000 * 60 * 5,
      },
    })

    return { hash, status }
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
        options: ttsOption.decode(task),
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

const getTtsTaskDto = z.object({
  hash: z.string().min(1, '任务哈希不能为空'),
})

function OR<const T extends {}>(...args: (T | false | undefined | null)[]) {
  return args.filter((item) => !!item) as T[]
}

export const getTtsTask = SA.encode(
  zf(getTtsTaskDto, async (props) => {
    const task = await prisma.ttsTask.findUnique({
      where: {
        hash: props.hash,
      },
    })
    if (!task) {
      throw Boom.notFound('任务不存在')
    }
    if (task.status === 'PENDING') {
      const status = await tryStartTtsTask({
        hash: props.hash,
        deviceId: task.deviceId,
        options: ttsOption.decode(task),
      })
      task.status = status
    }
    return task
  })
)

export type TtsTaskItem = SA_RES<typeof getTtsTask>

const getAllTtsTasksDto = z.object({
  deviceId: z.string(),
})

export const getAllTtsTasks = SA.encode(
  zf(getAllTtsTasksDto, async (props) => {
    const user = await getSelf().catch(noop)
    const allTasks = await prisma.ttsTask.findMany({
      where: {
        OR: OR(
          {
            deviceId: props.deviceId,
          },
          user && {
            userId: user.id,
          }
        ),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return allTasks.map((task) => ({
      ...task,
      options: null,
      desc: ttsOption
        .decode(task)
        .options.map((item) => item.text.slice(0, 30))
        .join('...'),
    }))
  })
)
