import { HoverableClock } from './clock/HoverableClock'

import { GA } from '@/analytics/GA'
import { DefaultAside } from '@/layout/DefaultAside'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'
import { Clock } from '@I/clock/components/Clock'
import { Dial, Hands } from '@I/clock/theme/13/exports'

export default function DefaultLayoutTsx({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <GA />
        <DefaultAside placement='left'>
          <HoverableClock clockIframePath='/clock/theme/13'>
            <Clock>
              <Dial width='100%' height='100%' />
              <Hands />
            </Clock>
          </HoverableClock>
        </DefaultAside>
        {children}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
