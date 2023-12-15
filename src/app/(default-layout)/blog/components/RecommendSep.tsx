import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

export function RecommendSep() {
  return (
    <Divider sx={{ mt: 8, mb: 4 }}>
      <Typography
        component='span'
        sx={{
          fontSize: '1.5em',
        }}
      >
        推荐阅读
      </Typography>
    </Divider>
  )
}
