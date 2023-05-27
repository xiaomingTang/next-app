'use client'

import { usePrefersColorSchema } from '@/common/contexts/PrefersColorSchema'

import { Button, IconButton, Typography } from '@mui/material'
import { DarkMode, LightMode } from '@mui/icons-material'
import { toast } from 'react-hot-toast'

export function Comp() {
  const { mode } = usePrefersColorSchema()
  return (
    <>
      <Button
        variant='contained'
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
        hello next app
      </Button>
      <IconButton
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
