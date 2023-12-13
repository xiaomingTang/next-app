import { seo } from '@/utils/seo'

import { clocks } from '@I/clock/constants'
import { Box, Grid } from '@mui/material'

export const metadata = seo.defaults({
  title: '时钟橱窗',
  description: '展示各种各样的时钟',
  keywords: '时钟,钟表,表,时间,表盘,表针,clock,dial',
})

export default function Index() {
  return (
    <Grid container sx={{ width: '100%' }} spacing={2}>
      {clocks.map(({ dial, hands, title }) => (
        <Grid
          key={title}
          item
          xs={6}
          sm={4}
          md={3}
          sx={{
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              pb: '100%',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                '--bg': '#eee',
              }}
            >
              {dial}
              {hands}
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}
