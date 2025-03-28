'use client'

import Typography from '@mui/material/Typography'
import { useLayoutEffect, useState } from 'react'

export function CopyrightYear() {
  const [year, setYear] = useState(2025)
  useLayoutEffect(() => {
    setYear(new Date().getFullYear())
  }, [])
  return <Typography aria-label={`版权声明: ${year} 年`}>© {year}</Typography>
}
