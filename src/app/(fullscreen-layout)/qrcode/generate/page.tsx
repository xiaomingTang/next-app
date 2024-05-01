import { seo } from '@/utils/seo'

import { redirect } from 'next/navigation'

export const metadata = seo.defaults({
  title: '生成二维码',
})

export default async function Index() {
  redirect('https://cli.im/')
}
