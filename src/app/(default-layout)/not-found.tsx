import { seo } from '@/utils/seo'
import { AlertError } from '@/components/Error'

export const metadata = seo.defaults({
  title: '页面不存在或已删除',
})

export default async function Home() {
  return <AlertError code={404} message='页面不存在或已删除' />
}
