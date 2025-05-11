import { ToGifIndex } from './components/ToGifIndex'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '图片转gif',
  description: '图片转gif,jpg转gif,png转gif,图片转动图,',
})

export default function Index() {
  return <ToGifIndex />
}
