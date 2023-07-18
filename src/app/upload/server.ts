'use server'

import { SA } from '@/errors/utils'

import { S3Client, PutObjectCommand, ObjectCannedACL } from '@aws-sdk/client-s3'

import type { PutObjectCommandInput } from '@aws-sdk/client-s3'

// upload from server: https://www.sammeechward.com/storing-images-in-s3-from-node-server
// acl: https://stackoverflow.com/a/73551886
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// TODO: 鉴权、public & private、contentType、参数合法性校验
export const upload = SA.encode(async (formData: FormData) => {
  const files = formData.getAll('files')
  const f = files[0] as Blob
  const data = Buffer.from(await f.arrayBuffer())

  const uploadParams: PutObjectCommandInput = {
    Bucket: process.env.AWS_BUCKET,
    Body: data,
    Key: `public/2-${f.name}`,
    ContentType: 'text/html',
    ACL: ObjectCannedACL.public_read,
  }
  const res = await s3Client.send(new PutObjectCommand(uploadParams))
  return res
})
