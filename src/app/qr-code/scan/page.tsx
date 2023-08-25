import '@/layout/FullscreenLayout.css'

import { QrCodeScanner } from './components/QrCodeScanner'

import FullscreenLayout from '@/layout/FullscreenLayout'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '二维码扫描',
})

export default async function Home() {
  return (
    <FullscreenLayout>
      <QrCodeScanner fit='cover' />
    </FullscreenLayout>
  )
}
