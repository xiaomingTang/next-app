import { BlogList } from './blog/components/BlogList'
import { getTags } from './admin/tag/server'
import { TagList } from './tag/components/TagList'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlogs } from '@/app/admin/blog/server'
import { seo } from '@/utils/seo'
import { ScrollToTop } from '@/components/ScrollToTop'
import { Error } from '@/components/Error'

import { BlogType } from '@prisma/client'

export const metadata = seo.defaults({
  title: '博客列表页',
})

export default async function Home() {
  const tagsRes = await getTags({})
  const blogsRes = await getBlogs({
    type: BlogType.PUBLISHED,
  })

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <ScrollToTop>
          <>
            {tagsRes?.data && <TagList tags={tagsRes.data} />}
            {tagsRes?.error && <Error {...tagsRes.error} />}
          </>
          <>
            {blogsRes.data && <BlogList blogs={blogsRes.data} />}
            {blogsRes.error && <Error {...blogsRes.error} />}
          </>
        </ScrollToTop>
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
