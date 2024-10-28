import { HoverableClock } from './components/HoverableClock'

import { seo } from '@/utils/seo'
import { Clock } from '@D/clock/components/Clock'
import { CLOCK_CONFIGS } from '@D/clock/constants'
import { Hands } from '@D/clock/components/Hands'

import Grid2 from '@mui/material/Grid2'

export const metadata = seo.defaults({
  title: '时钟橱窗',
  description: '展示各种各样的时钟',
  keywords: '时钟,钟表,表,时间,表盘,表针,clock,dial',
})

export default function Index() {
  return (
    <Grid2 container sx={{ width: '100%' }} spacing={2}>
      {CLOCK_CONFIGS.map((config) => (
        <Grid2
          key={config.id}
          size={{
            xs: 6,
            sm: 4,
            md: 3,
          }}
          sx={{
            position: 'relative',
          }}
        >
          <HoverableClock
            clockIframePath={`/clock/theme/${config.id}`}
            sx={{
              position: 'relative',
              pb: '100%',
            }}
          >
            <Clock
              sx={{
                position: 'absolute',
              }}
            >
              <config.Dial width='100%' height='100%' />
              <Hands config={config} />
            </Clock>
          </HoverableClock>
        </Grid2>
      ))}
    </Grid2>
  )
}
