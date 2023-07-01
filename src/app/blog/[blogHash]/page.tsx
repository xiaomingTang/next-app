import { BlogContent } from '../components/BlogContent'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import { getBlog } from '@/app/admin/blog/components/server'
import { Error } from '@/components/Error'

export default async function Home({
  params: { blogHash },
}: {
  params: { blogHash: string }
}) {
  const { data: blog, error } = await getBlog({
    hash: blogHash,
  })

  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        {blog ? <BlogContent {...blog} /> : <Error {...error} />}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
