import { ABOUT_PAGE_BLOG_HASH } from './constants'

import { seo } from '@/utils/seo'

import { redirect } from 'next/navigation'

export const metadata = seo.defaults({
  title: '关于我: 一个前端',
})

export default async function Index() {
  redirect(`/blog/${ABOUT_PAGE_BLOG_HASH}`)
}
