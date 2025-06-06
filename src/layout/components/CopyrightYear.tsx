'use client'

import Typography from '@mui/material/Typography'
import { useLayoutEffect, useState } from 'react'

export function CopyrightYear() {
  const [year, setYear] = useState(2025)
  useLayoutEffect(() => {
    setYear(new Date().getFullYear())
  }, [])
  return (
    <Typography>
      <Typography component='span' className='sr-only'>
        版权声明：
      </Typography>
      © {year}
    </Typography>
  )
}
