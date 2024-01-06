'use client'

import Anchor from '@/components/Anchor'

import { useRouter } from 'next/navigation'

export default function Home() {
  useRouter().replace('/admin/blog')

  return (
    <>
      正在跳转 <Anchor href='/admin/blog'>/admin/blog</Anchor>
    </>
  )
}
