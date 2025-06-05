'use server'

import { ttsEnvConfig } from './constants'

import { SA } from '@/errors/utils'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { ensureUser } from '@/user/validate'

import { z } from 'zod'

const globalTtsConfig = {
  enableGuest: ttsEnvConfig.enableGuest,
  enableUser: ttsEnvConfig.enableUser,
}

export const getTtsConfig = SA.encode(async () => {
  return globalTtsConfig
})

const updateTtsConfigDto = z.object({
  enableGuest: z.boolean(),
  enableUser: z.boolean(),
})

export const updateTtsConfig = SA.encode(
  zf(updateTtsConfigDto, async (props) => {
    ensureUser(await getSelf(), { roles: ['ADMIN'] })
    globalTtsConfig.enableGuest = props.enableGuest
    globalTtsConfig.enableUser = props.enableUser
    return globalTtsConfig
  })
)
