import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'

export default function LoadingPage() {
  return (
    <>
      <Typography
        variant='h5'
        sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}
      >
        TTS 任务详情
      </Typography>
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    </>
  )
}
