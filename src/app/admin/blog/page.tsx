import { getBlogs, willThrowError } from './server'
import { BlogTable, ErrorDesc } from './BlogTable'

export default async function Home() {
  const blogs = await getBlogs({
    creatorId: 0,
  })
  const planedError = await willThrowError()

  return (
    <>
      {planedError.error && <ErrorDesc message={planedError.error.message} />}
      <BlogTable {...blogs} />
    </>
  )
}
