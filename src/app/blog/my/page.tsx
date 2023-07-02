import { BlogItem } from '../components/BlogItem'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlogs } from '@/app/admin/blog/components/server'
import { SA } from '@/errors/utils'
import { seo } from '@/utils/seo'

import { BlogType } from '@prisma/client'

export const metadata = seo.defaults({
  title: '【私有】博客列表页',
})

export default async function Home() {
  const blogs = await getBlogs({
    type: BlogType.PRIVATE_PUBLISHED,
  }).then(SA.decode)

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        {blogs.map((blog) => (
          <BlogItem key={blog.hash} {...blog} />
        ))}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
