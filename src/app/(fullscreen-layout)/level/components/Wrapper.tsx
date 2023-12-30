import { LevelLine } from './Line'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'

import Box from '@mui/material/Box'

const hTotal = 10
const hList = Array.from(new Array(hTotal - 1)).map((_, i) => i + 1)
const vTotal = 10
const vList = Array.from(new Array(vTotal - 1)).map((_, i) => i + 1)

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
        {hList.map((i) => (
          <LevelLine
            key={`h-${i}`}
            orientation='horizontal'
            percentage={i / hTotal}
            highlight={i * 2 === hTotal}
          />
        ))}
        {vList.map((i) => (
          <LevelLine
            key={`v-${i}`}
            orientation='vertical'
            percentage={i / vTotal}
            highlight={i * 2 === vTotal}
          />
        ))}
        {children}
      </Box>
    </Box>
  )
}
