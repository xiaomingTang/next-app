import { Uploader } from './components/Uploader'

import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '文件上传',
})

export default async function Index() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <Uploader />
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
