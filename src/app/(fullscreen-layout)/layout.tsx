import '@/layout/FullscreenLayout.css'

import FullscreenLayout from '@/layout/FullscreenLayout'

export default function RawFullscreenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FullscreenLayout>{children}</FullscreenLayout>
}
