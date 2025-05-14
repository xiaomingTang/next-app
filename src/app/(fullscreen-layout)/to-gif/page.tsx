import { ToGifIndex } from './components/ToGifIndex'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '图片转gif',
  description: '纯前端的图片转gif工具，支持多种图片格式合并为gif',
  keywords:
    '图片转gif,jpg转gif,png转gif,图片转动图,jpg转动图,png转动图,图片合成gif,jpg合成gif,png合成gif,前端图片转gif,前端图片合成gif,浏览器图片转gif,浏览器图片合成gif,图片转动图工具,图片合成动图工具',
})

export default function Index() {
  return <ToGifIndex />
}
