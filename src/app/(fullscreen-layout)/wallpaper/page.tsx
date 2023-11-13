import { WallpaperRoot } from './components/WallpaperRoot'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '渐变色壁纸',
})

export default async function Home() {
  return <WallpaperRoot />
}
