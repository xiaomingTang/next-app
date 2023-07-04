'use client'

import { useElementScroll } from '@/hooks/useElementScroll'

import {
  Box,
  CircularProgress,
  Fab,
  Fade,
  circularProgressClasses,
} from '@mui/material'
import { useRef } from 'react'
import { KeyboardArrowUp } from '@mui/icons-material'

// TODO: fix: 不足一屏时, 百分比有误
export function ScrollToTop({
  children,
}: {
  children: React.ReactElement | React.ReactElement[]
}) {
  const elemRef = useRef<HTMLDivElement>(null)
  const scrollStarterRef = useRef<HTMLDivElement>(null)
  const { percent } = useElementScroll({ elem: elemRef })

  return (
    <>
      <Box ref={elemRef}>
        <div
          ref={scrollStarterRef}
          className='-translate-y-10 md:-translate-y-14'
        />
        {children}
      </Box>
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
