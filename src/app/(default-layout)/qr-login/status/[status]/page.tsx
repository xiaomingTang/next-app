import { QRLoginStatus } from './QRLoginStatus'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '扫码登录结果页',
})

interface Params {
  status: 'success' | 'failed'
}

interface Props {
  params: Promise<Params>
}

export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  return [{ status: 'success' }, { status: 'failed' }]
}

export default async function Index(props: Props) {
  const params = await props.params

  const { status } = params

  return <QRLoginStatus status={status} />
}
