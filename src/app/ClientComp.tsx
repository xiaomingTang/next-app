'use client'

import { usePrefersColorSchema } from '@/common/contexts/PrefersColorSchema'

import { Button, IconButton, Typography } from '@mui/material'
import { DarkMode, LightMode } from '@mui/icons-material'
import { toast } from 'react-hot-toast'
import { usePathname } from 'next/navigation'

export function Comp() {
  const pathname = usePathname()
  const { mode } = usePrefersColorSchema()
  return (
    <>
      <Button
        variant='contained'
        aria-label='test-1'
        onClick={() => {
          toast.success('error', {
            duration: 1000000,
          })
          toast.error('error', {
            duration: 1000000,
          })
          toast.loading('error', {
            duration: 1000000,
          })
        }}
      >
        hello {pathname}
      </Button>
      <IconButton
        aria-label='test-2'
        onClick={() => {
          usePrefersColorSchema.toggle()
        }}
      >
        <Typography>
          {mode === 'dark' ? <LightMode /> : <DarkMode />}
        </Typography>
      </IconButton>
    </>
  )
}
