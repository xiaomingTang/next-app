'use client'

import { useElementScroll } from '@/hooks/useElementScroll'
import { useUser } from '@/user'

import { KeyboardArrowUp } from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  Fab,
  Fade,
  circularProgressClasses,
} from '@mui/material'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'

export function Comp() {
  const pathname = usePathname()
  const user = useUser()
  const elemRef = useRef<HTMLDivElement>(null)
  const scrollStarterRef = useRef<HTMLDivElement>(null)
  const { percent } = useElementScroll({ elem: elemRef })

  return (
    <>
      <p>pathname: {pathname}</p>
      <p>user: {user.name}</p>
      <div style={{ height: '50vh' }}></div>
      <div style={{ height: '150vh', background: '#bbbbbb' }} ref={elemRef}>
        <div
          ref={scrollStarterRef}
          className='-translate-y-10 md:-translate-y-14'
        />
      </div>
      <div style={{ height: '100vh' }}></div>

      <Fade in={percent > 0}>
        <Box sx={{ position: 'fixed', bottom: 48, right: 16 }}>
          <CircularProgress
            variant='determinate'
            size={46}
            color='primary'
            sx={{
              position: 'absolute',
              top: -3,
              left: -3,
              [`& .${circularProgressClasses.circle}`]: {
                strokeLinecap: 'round',
              },
            }}
            value={percent * 100}
          />
          <Fab
            size='small'
            aria-label='scroll back to top'
            onClick={() => {
              scrollStarterRef.current?.scrollIntoView({
                behavior: 'smooth',
              })
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </Box>
      </Fade>
    </>
  )
}
