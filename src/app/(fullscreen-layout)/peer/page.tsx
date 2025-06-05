import { PeerClient } from './components/PeerClient'

import { AuthRequired } from '@/components/AuthRequired'
import { Forbidden } from '@/components/Forbidden'
import { b } from '@/config/formatter'
import { seo } from '@/utils/seo'

import { unstable_noStore as noStore } from 'next/cache'

export const metadata = seo.defaults({
  title: '点对点通信',
})

export default function Index() {
  // 确保 SYSTEM_CONFIG_PEER_AUTH_REQUIRED 使用的是运行时的值
  noStore()
  return (
    <AuthRequired
      disabled={b(process.env.SYSTEM_CONFIG_PEER_AUTH_REQUIRED)}
      fallback={<Forbidden />}
    >
      <PeerClient />
    </AuthRequired>
  )
}
