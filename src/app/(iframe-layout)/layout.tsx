import { GA } from '@/analytics/GA'

export default function IframeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <GA />
      {children}
    </>
  )
}
