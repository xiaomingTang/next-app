'use server'

import { SA } from '@/errors/utils'

import Boom from '@hapi/boom'

import crypto from 'crypto'

export const getStunCredentials = SA.encode(async () => {
  const TURN_SECRET = process.env.TURN_SECRET
  const TURN_SERVER = process.env.TURN_SERVER
  const STUN_SERVER = process.env.STUN_SERVER
  if (!TURN_SECRET) {
    throw Boom.serverUnavailable('TURN_SECRET 环境变量未设置')
  }
  if (!TURN_SERVER) {
    throw Boom.serverUnavailable('TURN_SERVER 环境变量未设置')
  }
  if (!STUN_SERVER) {
    throw Boom.serverUnavailable('STUN_SERVER 环境变量未设置')
  }
  // 临时用户名格式:  时间戳 (秒级) + 固定前缀，coturn 也支持其他格式
  // 1小时后过期
  const timestamp = Math.floor(Date.now() / 1000) + 3600
  const username = `${timestamp}:user`

  // 使用 HMAC-SHA1(secret, username)
  const hmac = crypto.createHmac('sha1', TURN_SECRET)
  hmac.update(username)
  const password = hmac.digest('base64')

  return { username, password, ttl: 3600, stun: STUN_SERVER, turn: TURN_SERVER }
})
