import { QRLoginConfirm } from './QRLoginConfirm'

import { AuthRequired } from '@/components/AuthRequired'
import { Forbidden } from '@/components/Forbidden'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '扫码登陆确认页',
  description: '确认是否登录？',
})

interface Params {
  token: string
}

interface Props {
  params: Promise<Params>
}

export default async function Index(props: Props) {
  const params = await props.params

  const { token } = params

  return (
    <AuthRequired fallback={<Forbidden />}>
      <QRLoginConfirm token={token} />
    </AuthRequired>
  )
}
