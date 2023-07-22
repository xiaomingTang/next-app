import { Uploader } from './components/Uploader'

import { Forbidden } from '@/components/Forbidden'
import { AuthRequired } from '@/components/AuthRequired'
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
        <AuthRequired fallback={<Forbidden />}>
          <Uploader />
        </AuthRequired>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
