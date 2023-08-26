import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '二维码生成',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>二维码生成</DefaultBodyContainer>
    </DefaultLayout>
  )
}
