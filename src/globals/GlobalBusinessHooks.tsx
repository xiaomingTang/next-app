'use client'

import { useInitGlobalAudio } from '@/components/useGlobalAudio'
import { useUser } from '@/user'

export function GlobalBusinessHooks() {
  useUser.useInit()
  useInitGlobalAudio()
  return <></>
}
