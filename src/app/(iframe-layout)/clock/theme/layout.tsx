import { Box } from '@mui/material'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        '--bg': '#eee',
      }}
    >
      {children}
    </Box>
  )
}
