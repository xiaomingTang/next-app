import { LevelAxis } from './Axis'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import Box from '@mui/material/Box'

export function LevelWrapper({
  children,
}: {
  children?: React.ReactNode | React.ReactNode[]
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <DefaultHeaderShim />
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          flex: '1 1 auto',
          overflow: 'hidden',
        }}
      >
        <LevelAxis />
        {children}
      </Box>
    </Box>
  )
}
