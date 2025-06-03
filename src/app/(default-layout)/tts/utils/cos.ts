import 'server-only'

import COS from 'cos-nodejs-sdk-v5'

const BUCKET = process.env.NEXT_PUBLIC_TC_COS_BUCKET
const REGION = process.env.NEXT_PUBLIC_TC_COS_REGION
const SECRET_ID = process.env.TC_COS_SECRET_ID
const SECRET_KEY = process.env.TC_COS_SECRET_KEY

export async function uploadToCos(filePath: string, key: string) {
  const cos = new COS({
    SecretId: SECRET_ID,
    SecretKey: SECRET_KEY,
  })

  return new Promise<string>((resolve, reject) => {
    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: key,
        Body: filePath,
      },
      (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.Location)
        }
      }
    )
  })
}
