import { QrcodeScanner } from './components/QrcodeScanner'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '扫描二维码',
})

export default async function Home() {
  return <QrcodeScanner fit='cover' />
}
