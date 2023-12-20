import { WallpaperRoot } from './components/WallpaperRoot'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '渐变色壁纸',
  description: '自定义色彩渐变，自定义尺寸',
  keywords: '壁纸,渐变,自定义',
})

export default async function Home() {
  return <WallpaperRoot />
}
