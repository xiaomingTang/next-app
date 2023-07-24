'use client'

import { useElementScroll } from '@/hooks/useElementScroll'
import { dark, light } from '@/utils/theme'

import {
  Box,
  CircularProgress,
  Fab,
  Fade,
  circularProgressClasses,
} from '@mui/material'
import { useRef } from 'react'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { common, grey } from '@mui/material/colors'

export function ScrollToTop({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
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
        <Fab
          size='medium'
          onClick={() => {
            scrollStarterRef.current?.scrollIntoView({
              behavior: 'smooth',
            })
          }}
          aria-label={`当前浏览进度 ${Math.floor(
            percent * 100
          )}%，点击滚动到顶部`}
          sx={{
            position: 'fixed',
            bottom: '48px',
            right: '16px',
            [dark()]: {
              backgroundColor: grey[800],
            },
            [light()]: {
              backgroundColor: common.white,
            },
          }}
        >
          <KeyboardArrowUpIcon color='primary' />
          <CircularProgress
            variant='determinate'
            size={48}
            color='primary'
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              [`& .${circularProgressClasses.circle}`]: {
                strokeLinecap: 'round',
                backgroundColor: 'red',
              },
            }}
            value={percent * 100}
            aria-hidden
          />
        </Fab>
      </Fade>
    </>
  )
}
