import 'server-only'
import Boom from '@hapi/boom'

import { createHmac } from 'node:crypto'

import type {
  ActionCardMessage,
  FeedCardMessage,
  LinkMessage,
  MarkdownMessage,
  TextMessage,
} from './type'

export function geneDingtalkUrl(src: string, openInSystemBrowser = true) {
  const url = new URL('dingtalk://dingtalkclient/page/link')
  url.searchParams.append('url', encodeURI(src))
  url.searchParams.append('pc_slide', openInSystemBrowser ? 'false' : 'true')
  return url
}

export async function sendToDingTalk(
  data:
    | TextMessage
    | LinkMessage
    | MarkdownMessage
    | ActionCardMessage
    | FeedCardMessage
) {
  const url = new URL(process.env.DINGTALK_WEB_HOOK)
  const timestamp = Date.now().toString()
  url.searchParams.set('timestamp', timestamp)

  const sign = createHmac('SHA256', process.env.DINGTALK_SECRET)
    .update(`${timestamp}\n${process.env.DINGTALK_SECRET}`)
    .digest('base64')
  url.searchParams.set('sign', sign)

  return fetch(url.href, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      charset: 'utf-8',
    },
  }).then(async (r) => {
    if (!r.ok) {
      throw Boom.badRequest(`发送到钉钉失败: ${r.statusText}`)
    }
    const resContent = (await r.json()) as {
      errcode: number
      errmsg: string
    }
    if (resContent.errcode !== 0) {
      console.error(resContent)
      throw Boom.badRequest(`发送到钉钉失败: ${resContent.errmsg}`)
    }
  })
}
