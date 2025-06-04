import { Typography } from '@mui/material'

export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Typography
        variant='h5'
        sx={{ textAlign: 'center', fontWeight: 'bold', mb: 2 }}
      >
        TTS 任务列表
      </Typography>
      {children}
    </>
  )
}
