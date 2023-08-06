'use server'

import { checkIsImage } from './utils/checkIsImage'
import { imageWithSize } from './utils/imageWithSize'

import { SA, pipePromiseAllSettled } from '@/errors/utils'
import { getSelf } from '@/user/server'
import { validateRequest } from '@/request/validator'
import { formatTime } from '@/utils/formatTime'

import { Type } from '@sinclair/typebox'
import Boom from '@hapi/boom'
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import { extension } from 'mime-types'

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

const S3_ROOT = `https://${process.env.C_AWS_BUCKET}.s3.${process.env.C_AWS_REGION}.amazonaws.com`

const uploadDto = Type.Object({
  /**
   * @default false (means public)
   */
  private: Type.Boolean(),
  /**
   * @default true
   * if false, will use File name,
   * if no File name, will use random name.
   */
  randomFilenameByServer: Type.Boolean(),
  /**
   * @default curDate (xxxx-xx-xx)
   */
  dirname: Type.String(),
})

function isFile(f: unknown): f is File {
  return !!f && (f as File).arrayBuffer instanceof Function
}

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

// TODO: 和用户关联起来, 实现 private 本人可见
export const uploadFiles = SA.encode(async (formData: FormData) => {
  await getSelf()
  const files = formData.getAll('files') as Blob[]

  if (!files.every((item) => isFile(item))) {
    throw Boom.badRequest('files 不是有效的文件数组')
  }
  const configStr = formData.get('config') || '{}'
  const inputConfig = JSON.parse(
    typeof configStr === 'string' ? configStr : '{}'
  )
  const config = validateRequest(uploadDto, {
    private: inputConfig.private ?? false,
    randomFilenameByServer: inputConfig.randomFilenameByServer ?? true,
    dirname: inputConfig.dirname || formatTime(new Date()).slice(0, 10),
  })
  const promise = Promise.allSettled(
    files.map(async (f) => {
      const rootPath = config.private ? 'private' : 'public'
      const inputExtList = f.name.split('.')
      const inputExt = inputExtList.length > 1 ? inputExtList.pop() : ''
      const gotExt = inputExt || extension(f.type)
      const ext = gotExt ? `.${gotExt}` : ''
      const filename =
        config.randomFilenameByServer || !f.name ? nanoid(12) + ext : f.name
      const pathname = strictPathname(
        `${rootPath}/${config.dirname}/${filename}`
      )
      const buffer = Buffer.from(await f.arrayBuffer())
      const uploadParams: PutObjectCommandInput = {
        Bucket: process.env.C_AWS_BUCKET,
        Body: buffer,
        Key: pathname,
        ContentType: f.type,
        ACL: config.private
          ? ObjectCannedACL.private
          : ObjectCannedACL.public_read,
      }
      const targetUrl = new URL(pathname, S3_ROOT)
      await s3Client.send(new PutObjectCommand(uploadParams))
      return {
        key: pathname,
        url: checkIsImage(f)
          ? (
              await imageWithSize({
                url: new URL(pathname, S3_ROOT),
                buffer,
              })
            ).href
          : targetUrl.href,
      }
    })
  ).then(pipePromiseAllSettled)
  return promise
})

export const deleteFile = SA.encode(async (key: string) => {
  const deleteParams: DeleteObjectCommandInput = {
    Bucket: process.env.C_AWS_BUCKET,
    Key: key,
  }
  await s3Client.send(new DeleteObjectCommand(deleteParams))
})
