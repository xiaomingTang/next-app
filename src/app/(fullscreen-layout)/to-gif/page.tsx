import { ToGifIndex } from './components/ToGifIndex'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '图片转gif',
  description: '纯前端的图片转gif工具，支持多种图片格式合并为gif',
  keywords: '图片转gif,jpg转gif,png转gif,图片转动图',
})

export default function Index() {
  return <ToGifIndex />
}
