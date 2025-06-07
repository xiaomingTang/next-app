import 'client-only'

import { randStr } from './string'

const STORAGE_KEY = 'deviceId-for-tts-task'
let memoDeviceId: string | null = null

export async function getDeviceId(): Promise<string> {
  if (memoDeviceId) {
    return memoDeviceId
  }
  const localId = localStorage.getItem(STORAGE_KEY)
  if (localId) {
    memoDeviceId = localId
    return memoDeviceId
  }
  memoDeviceId = randStr(16)
  try {
    localStorage.setItem(STORAGE_KEY, memoDeviceId)
  } catch (error) {
    console.error('Failed to store deviceId in localStorage:', error)
  }

  return memoDeviceId
}
