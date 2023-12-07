import { QRLoginConfirm } from './QRLoginConfirm'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '扫码登陆确认页',
  description: '确认是否登录？',
})

interface Props {
  params: { token: string }
}

export default function Home({ params: { token } }: Props) {
  return <QRLoginConfirm token={token} />
}
