import { Paper, Typography } from '@mui/material'

export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Typography
        variant='h5'
        sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}
      >
        TTS 任务详情
      </Typography>
      <Paper sx={{ p: 2 }}>{children}</Paper>
    </>
  )
}
