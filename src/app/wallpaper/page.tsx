import '@/layout/FullscreenLayout.css'

import { WallpaperRoot } from './components/WallpaperRoot'

import FullscreenLayout from '@/layout/FullscreenLayout'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '渐变色壁纸',
})

export default async function Home() {
  return (
    <FullscreenLayout>
      <WallpaperRoot />
    </FullscreenLayout>
  )
}
