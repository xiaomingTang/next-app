import Span from '@/components/Span'

import Divider from '@mui/material/Divider'

export function RecommendSep() {
  return (
    <Divider sx={{ mt: 8, mb: 4 }} role='presentation'>
      <Span
        sx={{
          fontSize: '1.5em',
        }}
      >
        推荐阅读
      </Span>
    </Divider>
  )
}
