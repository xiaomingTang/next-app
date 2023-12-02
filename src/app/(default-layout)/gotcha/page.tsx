import { Gotcha } from './Gotcha'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '抓住你了',
  description: '我知道你访问过哪些网站',
})

export default function Home() {
  return <Gotcha />
}
