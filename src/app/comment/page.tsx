import { CommentArea } from './components/CommentArea'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '向站长留言',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <CommentArea />
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
