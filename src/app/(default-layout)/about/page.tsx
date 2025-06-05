import { ABOUT_PAGE_BLOG_HASH } from './constants'

import { seo } from '@/utils/seo'
import { resolvePath } from '@/utils/url'

import { redirect } from 'next/navigation'

export const metadata = seo.defaults({
  title: '关于我: 一个前端',
  alternates: {
    canonical: resolvePath('/about').href,
  },
})

export default async function Index() {
  redirect(`/blog/${ABOUT_PAGE_BLOG_HASH}`)
}
