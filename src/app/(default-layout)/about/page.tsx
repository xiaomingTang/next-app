import { seo } from '@/utils/seo'

import { redirect } from 'next/navigation'

export const metadata = seo.defaults({
  title: '关于我: 一个前端',
})

export default async function Index() {
  redirect('/blog/3EpPJTM2LwB_')
}
