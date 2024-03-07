import { PeerClient } from './components/PeerClient'

import { AuthRequired } from '@/components/AuthRequired'
import { Forbidden } from '@/components/Forbidden'
import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '点对点通信',
})

export default function Index() {
  return (
    <AuthRequired fallback={<Forbidden />}>
      <PeerClient />
    </AuthRequired>
  )
}
