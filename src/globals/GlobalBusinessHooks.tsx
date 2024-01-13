'use client'

import { useUser } from '@/user'

export function GlobalBusinessHooks() {
  useUser.useInit()
  return <></>
}
