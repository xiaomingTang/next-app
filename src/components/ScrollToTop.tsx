'use client'

import { useElementScroll } from '@/hooks/useElementScroll'
import { dark } from '@/utils/theme'

import {
  Box,
  CircularProgress,
  Fab,
  Fade,
  circularProgressClasses,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useRef } from 'react'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { common, grey } from '@mui/material/colors'

const SIZE_MAP = {
  small: 40,
  medium: 48,
  large: 56,
}

export function ScrollToTop({
  size: inputSize,
  children,
}: {
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode | React.ReactNode[]
}) {
  const isSmall = useMediaQuery(useTheme().breakpoints.down('sm'))
  const size = inputSize ?? (isSmall ? 'small' : 'medium')
  const w = SIZE_MAP[size]
  const elemRef = useRef<HTMLDivElement>(null)
  const scrollStarterRef = useRef<HTMLDivElement>(null)
  const { percent } = useElementScroll({ elem: elemRef })

  return (
    <>
      <Box ref={elemRef}>
        <Box
          ref={scrollStarterRef}
          sx={{
            // header height
            transform: {
              xs: 'translateY(-40px)',
              md: 'translateY(-56px)',
            },
          }}
        />
        {children}
      </Box>
      <Fade in={percent > 0}>
        <Fab
          size={size}
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
            // 避免有弹出层设置 overflow: hidden 导致的按钮抖动
            left: `calc(100vw - ${w}px - 16px - 16px)`,
            backgroundColor: common.white,
            [dark()]: {
              backgroundColor: grey[800],
            },
          }}
        >
          <KeyboardArrowUpIcon color='primary' />
          <CircularProgress
            variant='determinate'
            size={w}
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
