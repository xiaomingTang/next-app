import { GA } from '@/analytics/GA'

export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GA />
      {children}
    </>
  )
}
