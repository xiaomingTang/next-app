'use client'

import { useInitAudio } from '@/components/useAudio'
import { useUser } from '@/user'

export function GlobalBusinessHooks() {
  useUser.useInit()
  useInitAudio()
  return <></>
}
