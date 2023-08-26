import '@/layout/FullscreenLayout.css'

import { QrcodeScanner } from './components/QrcodeScanner'

import FullscreenLayout from '@/layout/FullscreenLayout'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '扫描二维码',
})

export default async function Home() {
  return (
    <FullscreenLayout>
      <QrcodeScanner fit='cover' />
    </FullscreenLayout>
  )
}
