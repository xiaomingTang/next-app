import { seo } from '@/utils/seo'
import { AlertError } from '@/components/Error'
import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { GA } from '@/analytics/GA'

export const metadata = seo.defaults({
  title: '页面不存在或已删除',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <GA />
        <AlertError code={404} message='页面不存在或已删除' />
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
