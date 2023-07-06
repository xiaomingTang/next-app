'use client'

import { useElementScroll } from '@/hooks/useElementScroll'

import {
  Box,
  CircularProgress,
  Fab,
  Fade,
  circularProgressClasses,
  useTheme,
} from '@mui/material'
import { useRef } from 'react'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

// TODO: fix: 不足一屏时, 百分比有误
export function ScrollToTop({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  const theme = useTheme()
  const elemRef = useRef<HTMLDivElement>(null)
  const scrollStarterRef = useRef<HTMLDivElement>(null)
  const { percent } = useElementScroll({ elem: elemRef })

  return (
    <>
      <Box ref={elemRef}>
        <Box
          ref={scrollStarterRef}
          className='-translate-y-10 md:-translate-y-14'
        />
        {children}
      </Box>
      <Fade in={percent > 0}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 48,
            right: 16,
            zIndex: theme.zIndex.fab,
          }}
        >
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
            <KeyboardArrowUpIcon />
          </Fab>
        </Box>
      </Fade>
    </>
  )
}
