import Boom from '@hapi/boom'

import { createHmac } from 'node:crypto'

import type {
  ActionCardMessage,
  FeedCardMessage,
  LinkMessage,
  MarkdownMessage,
  TextMessage,
} from './type'

export const DINGTALK_WEB_HOOK =
  'https://oapi.dingtalk.com/robot/send?access_token=51453f5355d72e3042572ce855c6dcdcee39e6ea4fcf1a2a950949b95ca4148b'

export const DINGTALK_SECRET =
  'SEC1e339a3974cd07bb064937df2444a732b0b448c5c125081302078251b7a3eee5'

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
  const url = new URL(DINGTALK_WEB_HOOK)
  const timestamp = Date.now().toString()
  url.searchParams.set('timestamp', timestamp)

  const sign = createHmac('SHA256', DINGTALK_SECRET)
    .update(`${timestamp}\n${DINGTALK_SECRET}`)
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
      throw Boom.badRequest(`发送到钉钉失败: ${resContent.errcode}`)
    }
  })
}
