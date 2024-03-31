import { HoverableClock } from './clock/HoverableClock'

import { Hands } from '../(iframe-layout)/clock/components/Hands'
import { DEFAULT_CLOCK_CONFIG } from '../(iframe-layout)/clock/theme/[theme]/constants'

import { GA } from '@/analytics/GA'
import { DefaultAside } from '@/layout/DefaultAside'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'
import { Clock } from '@I/clock/components/Clock'

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
              <DEFAULT_CLOCK_CONFIG.Dial width='100%' height='100%' />
              <Hands config={DEFAULT_CLOCK_CONFIG} />
            </Clock>
          </HoverableClock>
        </DefaultAside>
        {children}
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
