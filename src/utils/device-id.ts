import 'client-only'

import fingerPrint from '@fingerprintjs/fingerprintjs'
import { genePromiseOnce } from '@zimi/utils'

async function rawGetDeviceId(): Promise<string> {
  const fp = await fingerPrint.load()
  const result = await fp.get()
  const deviceId = result.visitorId

  return deviceId
}

export const getDeviceId = genePromiseOnce(rawGetDeviceId)
