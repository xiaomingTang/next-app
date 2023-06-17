'use client'

import { useUser } from '@/user'

import { usePathname } from 'next/navigation'

export function Comp() {
  const pathname = usePathname()
  const user = useUser()
  return (
    <>
      <p>pathname: {pathname}</p>
      <p>user: {user.name}</p>
      <div style={{ height: '200vh' }}></div>
    </>
  )
}
