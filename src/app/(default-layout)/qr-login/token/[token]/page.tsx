import { QRLoginConfirm } from './QRLoginConfirm'

import { AuthRequired } from '@/components/AuthRequired'
import { Forbidden } from '@/components/Forbidden'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '扫码登陆确认页',
  description: '确认是否登录？',
})

interface Props {
  params: { token: string }
}

export default function Index({ params: { token } }: Props) {
  return (
    <AuthRequired fallback={<Forbidden />}>
      <QRLoginConfirm token={token} />
    </AuthRequired>
  )
}
