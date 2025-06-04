import { GA } from '@/analytics/GA'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'

export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <GA />
        {children}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
