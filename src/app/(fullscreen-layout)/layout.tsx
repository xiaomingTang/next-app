import FullscreenLayout from '@/layout/FullscreenLayout'
import { GA } from '@/analytics/GA'

export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <FullscreenLayout>
      <GA />
      {children}
    </FullscreenLayout>
  )
}
