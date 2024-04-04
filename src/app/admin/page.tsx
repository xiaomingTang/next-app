'use client'

import Anchor from '@/components/Anchor'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/blog')
  }, [router])

  return (
    <>
      正在跳转 <Anchor href='/admin/blog'>/admin/blog</Anchor>
    </>
  )
}
