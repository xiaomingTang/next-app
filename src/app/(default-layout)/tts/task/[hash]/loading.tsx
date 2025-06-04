import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export default function LoadingPage() {
  return (
    <Box display='flex' justifyContent='center' alignItems='center'>
      <CircularProgress />
    </Box>
  )
}
