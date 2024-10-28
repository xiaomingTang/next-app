import { HoverableClock } from './HoverableClock'
import { Hands } from './Hands'
import { Clock } from './Clock'

import { DEFAULT_CLOCK_CONFIG } from '../constants'

export function DefaultClock() {
  return (
    <HoverableClock clockIframePath='/clock/theme/13'>
      <Clock>
        <DEFAULT_CLOCK_CONFIG.Dial width='100%' height='100%' />
        <Hands config={DEFAULT_CLOCK_CONFIG} />
      </Clock>
    </HoverableClock>
  )
}
