import { QRLoginStatus } from './QRLoginStatus'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '扫码登录结果页',
})

interface Props {
  params: { status: 'success' | 'failed' }
}

export const dynamicParams = false

export async function generateStaticParams(): Promise<Props['params'][]> {
  return [{ status: 'success' }, { status: 'failed' }]
}

export default function Index({ params: { status } }: Props) {
  return <QRLoginStatus status={status} />
}
