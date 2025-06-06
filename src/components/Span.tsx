import Typography from '@mui/material/Typography'

import type { TypographyProps } from '@mui/material/Typography'

/**
 * A custom Typography component that renders as a <span> by default.
 */
export default function Span(props: TypographyProps) {
  return <Typography component='span' {...props} />
}
