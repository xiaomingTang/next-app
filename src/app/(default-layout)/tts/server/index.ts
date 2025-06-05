'use server'

import { getTtsConfig } from './ttsConfig'
import { ttsEnvConfig } from './constants'

import { ttsQueue } from '../utils/ttsQueue'
import { ttsOptionParser } from '../utils/ttsOptionParser'

import { SA } from '@/errors/utils'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { prisma } from '@/request/prisma'
import { OR } from '@/request/utils'

import { z } from 'zod'
import { nanoid } from 'nanoid'
import { noop } from 'lodash-es'
import Boom from '@hapi/boom'

import type { SA_RES } from '@/errors/utils'

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

void ttsQueue.init()

export const tts = SA.encode(
  zf(ttsDto, async (props) => {
    await ttsQueue.init()
    const user = await getSelf().catch(noop)
    const ttsConfig = await getTtsConfig().then(SA.decode)

    if (!user && !ttsConfig.enableGuest) {
      throw Boom.forbidden('游客不允许使用TTS服务')
    }
    if (user?.role === 'USER' && !ttsConfig.enableUser) {
      throw Boom.forbidden('普通用户不允许使用TTS服务')
    }

    // 单用户限流
    const processingCount = await prisma.ttsTask.count({
      where: {
        OR: OR(
          {
            deviceId: props.deviceId,
          },
          user && {
            userId: user.id,
          }
        ),
        status: {
          in: ['PENDING', 'PROCESSING'],
        },
      },
    })

    const msg = `当前你有 ${processingCount} 个任务正在进行中，请等待前面的任务完成后再提交新的任务`

    if (!user && processingCount >= ttsEnvConfig.guestConcurrency) {
      throw Boom.forbidden(msg)
    }

    if (
      user?.role === 'USER' &&
      processingCount >= ttsEnvConfig.userConcurrency
    ) {
      throw Boom.forbidden(msg)
    }

    // 接口限流
    const recentTaskCount = await prisma.ttsTask.count({
      where: {
        createdAt: {
          // 1 分钟内
          gte: new Date(Date.now() - 1000 * 60 * 1),
        },
      },
    })

    if (recentTaskCount >= ttsEnvConfig.secondlyConcurrency) {
      throw Boom.tooManyRequests('当前请求过于频繁，请稍后再试')
    }

    /**
     * 任务的唯一标识
     */
    const hash = nanoid(12)
    const voice = props.voice.trim()
    const rate = props.rate.trim()
    const volume = props.volume.trim()
    const pitch = props.pitch.trim()
    const filename = `${hash}.mp3`

    const texts = props.texts.map((text) => ({
      ...text,
      voice: text.voice?.trim() || voice,
      rate: text.rate?.trim() || rate,
      volume: text.volume?.trim() || volume,
      pitch: text.pitch?.trim() || pitch,
    }))

    const createRes = await prisma.ttsTask.create({
      data: {
        hash,
        status: 'PENDING',
        deviceId: props.deviceId,
        userId: user?.id || null,
        options: ttsOptionParser.encode({
          options: texts,
          output: `./tmp/${filename}`,
          timeoutMs: 1000 * 60 * 5,
        }),
      },
    })

    ttsQueue.appendTtsQueue({
      role: user?.role,
      ttsHash: hash,
    })

    return { hash, status: createRes.status }
  })
)

const ttsCheckDto = z.object({
  hash: z.string().min(1, '任务 hash 不能为空'),
})

export const checkTtsTask = SA.encode(
  zf(ttsCheckDto, async (props) => {
    const task = await prisma.ttsTask.findUnique({
      where: { hash: props.hash },
    })

    if (!task) {
      throw Boom.notFound('任务不存在')
    }

    return {
      status: task.status,
      error: task.error || null,
    }
  })
)

const getTtsTaskDto = z.object({
  hash: z.string().min(1, '任务 hash 不能为空'),
})

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
    return {
      ...task,
      options: ttsOptionParser.decode(task),
    }
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
      desc: ttsOptionParser
        .decode(task)
        .options.map((item) => item.text.slice(0, 30))
        .join('...'),
    }))
  })
)
