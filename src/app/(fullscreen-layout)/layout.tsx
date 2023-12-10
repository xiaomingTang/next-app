import '@/layout/FullscreenLayout.css'

import FullscreenLayout from '@/layout/FullscreenLayout'
import { GA } from '@/analytics/GA'

export default function RawFullscreenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <FullscreenLayout>
      <GA />
      {children}
    </FullscreenLayout>
  )
}
