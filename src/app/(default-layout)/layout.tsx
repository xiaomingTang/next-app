import { GA } from '@/analytics/GA'
import { DefaultAside } from '@/layout/DefaultAside'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'

import dynamic from 'next/dynamic'

const DefaultClock = dynamic(() =>
  import('@D/clock/components/DefaultClock').then((res) => res.DefaultClock)
)

export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <GA />
        <DefaultAside placement='left'>
          <DefaultClock />
        </DefaultAside>
        {children}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
