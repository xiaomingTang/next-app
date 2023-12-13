import { clocks } from './constants'

import { Box, Grid } from '@mui/material'

export default function Index() {
  return (
    <Grid container sx={{ width: '100%' }}>
      {clocks.map(({ dial, hands, title }) => (
        <Grid
          key={title}
          item
          xs={6}
          sm={4}
          md={3}
          lg={2}
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
