import { TagList } from './components/TagList'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { getTags } from '@/app/admin/tag/components/server'
import { Error } from '@/components/Error'

export const metadata = seo.defaults({
  title: '标签列表页',
})

export default async function Home() {
  const tagsRes = await getTags({})

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <ScrollToTop>
          <>
            {tagsRes?.data && <TagList tags={tagsRes.data} />}
            {tagsRes?.error && <Error {...tagsRes.error} />}
          </>
        </ScrollToTop>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
