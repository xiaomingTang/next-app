'use server'

import { SA, pipePromiseAllSettled } from '@/errors/utils'
import { getSelf } from '@/user/server'
import { validateRequest } from '@/request/validator'
import { formatTime } from '@/utils/formatTime'
import { prisma } from '@/request/prisma'

import Boom from '@hapi/boom'
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'
import { extension } from 'mime-types'
import { Type } from '@sinclair/typebox'
import { Role } from '@prisma/client'

import type { Static } from '@sinclair/typebox'
import type {
  DeleteObjectCommandInput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3'

// upload from server: https://www.sammeechward.com/storing-images-in-s3-from-node-server
// acl: https://stackoverflow.com/a/73551886
const s3Client = new S3Client({
  region: process.env.C_AWS_REGION,
  credentials: {
    accessKeyId: process.env.C_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.C_AWS_SECRET_ACCESS_KEY,
  },
})

const S3_ROOT = new URL(
  `https://${process.env.C_AWS_BUCKET}.s3.${process.env.C_AWS_REGION}.amazonaws.com`
)

const uploadConfigDto = Type.Object({
  /**
   * @default true
   * if false (admin only), will use File name,
   * if no File name, will use random name.
   */
  randomFilenameByServer: Type.Boolean(),
  /**
   * @default curDate (xxxx-xx-xx)
   * @warning admin only
   */
  dirname: Type.String(),
  files: Type.Array(
    Type.Object({
      name: Type.String(),
      type: Type.String(),
      size: Type.Number(),
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

export const requestUploadFiles = SA.encode(
  async (inputConfig: Static<typeof uploadConfigDto>) => {
    const user = await getSelf()
    const config = validateRequest(uploadConfigDto, inputConfig)
    if (user.role !== Role.ADMIN) {
      if (config.dirname) {
        throw Boom.forbidden('无权限自定义目录')
      }
      if (!config.randomFilenameByServer) {
        throw Boom.forbidden('无权限自定义文件名')
      }
      if (config.files.some((f) => f.size > 5 * 1024 * 1024)) {
        throw Boom.forbidden('最大支持上传尺寸: 5 MB')
      }
      const today = new Date(Date.now())
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
      if (todayUploaded + config.files.length > 10) {
        throw Boom.badRequest(
          `普通用户一天最多上传 10 个文件, 你还能上传 ${Math.max(
            0,
            10 - todayUploaded
          )} 个`
        )
      }
      if (totalUploaded + config.files.length > 50) {
        throw Boom.badRequest(
          `普通用户总计最多上传 50 个文件, 你还能上传 ${Math.max(
            0,
            50 - totalUploaded
          )} 个`
        )
      }
    } else if (config.files.some((f) => f.size > 50 * 1024 * 1024)) {
      throw Boom.forbidden('最大支持上传尺寸: 50 MB')
    }
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
        const uploadParams: PutObjectCommandInput = {
          Bucket: process.env.C_AWS_BUCKET,
          Key: uploadKey,
          ContentType: f.type,
          ContentLength: f.size,
          ACL: ObjectCannedACL.public_read,
        }

        const command = new PutObjectCommand(uploadParams)

        return {
          url: await getSignedUrl(s3Client, command, { expiresIn: 3600 }),
          key: uploadKey,
        }
      })
    ).then(pipePromiseAllSettled)

    await prisma.upload.createMany({
      data: res
        .filter((item) => item.status === 'fulfilled')
        .map((item) => ({
          creatorId: user.id,
          key: item.status === 'fulfilled' ? item.value.key : '',
          url: item.status === 'fulfilled' ? item.value.url : '',
        })),
    })

    return res
  }
)

export const deleteFile = SA.encode(async (href: string) => {
  const user = await getSelf()
  const url = new URL(href)
  if (url.origin !== S3_ROOT.origin) {
    throw Boom.badRequest(`不支持的源: ${url.origin}`)
  }
  // s3 删除 key 是不要前缀 '/' 的
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

  const deleteParams: DeleteObjectCommandInput = {
    Bucket: process.env.C_AWS_BUCKET,
    Key: deletedKey,
  }
  await s3Client.send(new DeleteObjectCommand(deleteParams))
})
