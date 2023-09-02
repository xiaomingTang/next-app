import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '向站长留言 (施工中...)',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>向站长留言 (施工中...)</DefaultBodyContainer>
    </DefaultLayout>
  )
}
