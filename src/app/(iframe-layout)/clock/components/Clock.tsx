import { Box, type BoxProps } from '@mui/material'

export function Clock({ sx, children, ...props }: BoxProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        '--bg': 'var(--custom-bg)',
        color: 'var(--custom-fg)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}
