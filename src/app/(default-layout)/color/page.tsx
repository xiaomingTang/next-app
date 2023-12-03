import { ColorIndex } from './ColorIndex'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '给你点颜色瞧瞧',
  description: '演示图片从一个主色调转变为另一个主色调',
})

export default async function Home() {
  return <ColorIndex />
}
