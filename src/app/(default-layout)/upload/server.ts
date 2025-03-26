'use server'

import { getCdnUrl } from './utils/getCdnUrl'

import { SA, pipePromiseAllSettled } from '@/errors/utils'
import { getSelf } from '@/user/server'
import { zf } from '@/request/validator'
import { MB_SIZE, formatTime } from '@/utils/transformer'
import { prisma } from '@/request/prisma'
import { getLocalStartsOfToday } from '@/utils/time'

import Boom from '@hapi/boom'
import { nanoid } from 'nanoid'
import { extension } from 'mime-types'
import { Role } from '@prisma/client'
import STS from 'qcloud-cos-sts'
import COS from 'cos-nodejs-sdk-v5'
import { z } from 'zod'

const uploadConfigDto = z.object({
  /**
   * @default true
   * if false (admin only), will use File name,
   * if no File name, will use random name.
   */
  randomFilenameByServer: z.boolean(),
  /**
   * @default curDate (xxxx-xx-xx)
   * @warning admin only
   */
  dirname: z.string(),
  files: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      size: z.number(),
    })
  ),
})

function strictPathname(p: string) {
  let pathname = p.replace(/\.+/g, '.').replace(/\/+/, '/')
  pathname = pathname
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s !== '.')
    .join('/')
  return pathname
}

const BUCKET = process.env.NEXT_PUBLIC_TC_COS_BUCKET
const REGION = process.env.NEXT_PUBLIC_TC_COS_REGION
const SECRET_ID = process.env.TC_COS_SECRET_ID
const SECRET_KEY = process.env.TC_COS_SECRET_KEY

/**
 * 普通用户允许上传的最大数量
 */
const MAX_UPLOAD_TOTAL = 500
/**
 * 普通用户单日允许上传的最大数量
 */
const MAX_UPLOAD_PER_DAY = 20
/**
 * 普通用户允许上传的最大尺寸（单位 MB）
 */
const MAX_SIZE_MB = 5

async function validateUploadConfig(config: z.infer<typeof uploadConfigDto>) {
  const user = await getSelf()
  if (user.role === Role.ADMIN) {
    return
  }
  if (config.dirname) {
    throw Boom.forbidden('无权限自定义目录')
  }
  if (!config.randomFilenameByServer) {
    throw Boom.forbidden('无权限自定义文件名')
  }
  if (config.files.some((f) => f.size > MAX_SIZE_MB * MB_SIZE)) {
    throw Boom.forbidden(`最大支持上传尺寸: ${MAX_SIZE_MB} MB`)
  }
  const today = getLocalStartsOfToday()
  const nextDay = new Date(today)
  nextDay.setDate(today.getDate() + 1)
  const [todayUploaded, totalUploaded] = await prisma.$transaction([
    prisma.upload.count({
      where: {
        creatorId: user.id,
        updatedAt: {
          gt: today,
          lt: nextDay,
        },
      },
    }),
    prisma.upload.count({
      where: {
        creatorId: user.id,
      },
    }),
  ])
  if (todayUploaded + config.files.length > MAX_UPLOAD_PER_DAY) {
    throw Boom.badRequest(
      `普通用户一天最多上传 ${MAX_UPLOAD_PER_DAY} 个文件, 你还能上传 ${Math.max(
        0,
        MAX_UPLOAD_PER_DAY - todayUploaded
      )} 个`
    )
  }
  if (totalUploaded + config.files.length > MAX_UPLOAD_TOTAL) {
    throw Boom.badRequest(
      `普通用户总计最多上传 ${MAX_UPLOAD_TOTAL} 个文件, 你还能上传 ${Math.max(
        0,
        MAX_UPLOAD_TOTAL - totalUploaded
      )} 个`
    )
  }
}

export const requestUploadFiles = SA.encode(
  zf(uploadConfigDto, async (config) => {
    const user = await getSelf()
    await validateUploadConfig(config)
    // 为 dirname 赋初始值
    config.dirname = config.dirname || formatTime(new Date()).slice(0, 10)
    const res = await Promise.allSettled(
      config.files.map(async (f) => {
        const rootPath = 'public'
        const inputExtList = f.name.split('.')
        const inputExt = inputExtList.length > 1 ? inputExtList.pop() : ''
        const gotExt = inputExt || extension(f.type)
        const ext = gotExt ? `.${gotExt}` : ''
        const filename =
          config.randomFilenameByServer || !f.name ? nanoid(12) + ext : f.name
        const uploadKey = strictPathname(
          `${rootPath}/${config.dirname}/${filename}`
        )

        const uploadPolicy = STS.getPolicy([
          {
            bucket: BUCKET,
            region: REGION,
            action: [
              // 简单上传
              'name/cos:PutObject',
              'name/cos:PostObject',
              // 分片上传
              'name/cos:sliceUploadFile',
              'name/cos:InitiateMultipartUpload',
              'name/cos:ListMultipartUploads',
              'name/cos:ListParts',
              'name/cos:UploadPart',
              'name/cos:CompleteMultipartUpload',
            ],
            prefix: uploadKey,
          },
        ])
        const strictPolicy = {
          ...uploadPolicy,
          statement: uploadPolicy.statement.map((item) => ({
            ...item,
            condition: {
              numeric_equal: {
                'cos:content-length': f.size,
              },
              string_equal: {
                'cos:content-type': f.type,
              },
            },
          })),
        }

        const credential = await STS.getCredential({
          policy: strictPolicy,
          secretId: SECRET_ID,
          secretKey: SECRET_KEY,
          region: REGION,
        })

        return {
          /**
           * upload key (in general, pathname)
           */
          key: uploadKey,
          credential: credential.credentials,
        }
      })
    ).then(pipePromiseAllSettled)

    await prisma.upload.createMany({
      data: res
        .filter((item) => item.status === 'fulfilled')
        .map((item) => {
          if (item.status !== 'fulfilled') {
            // MD 不知道为什么 ts 类型抽风了
            throw new Error('Impossible Promise rejected')
          }
          const { key } = item.value
          const url = getCdnUrl({ key })
          return {
            creatorId: user.id,
            key: item.status === 'fulfilled' ? key : '',
            url: item.status === 'fulfilled' ? url.href : '',
          }
        }),
    })

    return res
  })
)

export const deleteFile = SA.encode(async (href: string) => {
  const user = await getSelf()
  const url = new URL(href)
  if (url.origin !== getCdnUrl().origin) {
    throw Boom.badRequest(`不支持的源: ${url.origin}`)
  }
  // tencent cos 删除 key 是不要前缀 '/' 的
  const deletedKey = url.pathname.slice(1)

  if (user.role !== Role.ADMIN) {
    const deletedItem = await prisma.upload.findFirst({
      where: {
        creatorId: user.id,
        key: deletedKey,
      },
    })
    if (!deletedItem) {
      throw Boom.notFound('文件不存在或者无删除权限')
    }
  }
  const cos = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRET_KEY,
  })
  await cos.deleteObject({
    Bucket: BUCKET,
    Region: REGION,
    Key: deletedKey,
  })
})
