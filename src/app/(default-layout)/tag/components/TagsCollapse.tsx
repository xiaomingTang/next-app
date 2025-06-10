'use client'

import { Box, ButtonBase, useMediaQuery, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

interface TagsCollapseProps {
  defaultOpen: boolean
  children: React.ReactNode
  height: [string, string]
}

function xs<const T>(v: T) {
  return {
    xs: v,
    sm: 'unset' as const,
  }
}

// 共用状态
let activeOpen: boolean | null = null

export function TagsCollapse({
  defaultOpen,
  height,
  children,
}: TagsCollapseProps) {
  const [open, setOpen] = useState(activeOpen ?? defaultOpen)
  const isXs = useMediaQuery(useTheme().breakpoints.down('sm'))

  useEffect(() => {
    activeOpen = open
  }, [open])

  return (
    <Box
      sx={{
        position: xs('relative'),
        px: xs(1),
        py: xs(0.5),
        maxHeight: xs(open ? height[1] : height[0]),
        overflow: xs('hidden'),
        transition: xs('max-height 0.3s ease-in-out'),
        cursor: xs(open ? 'auto' : 'pointer'),
      }}
    >
      <Box aria-hidden={isXs && !open ? 'true' : 'false'} inert={isXs && !open}>
        {children}
      </Box>
      <ButtonBase
        aria-hidden={isXs && !open ? 'false' : 'true'}
        aria-label={isXs && !open ? '展开标签列表' : undefined}
        onClick={() => setOpen(!open)}
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          opacity: open ? 0 : 1,
          pointerEvents: open ? 'none' : 'auto',
          borderRadius: '4px',
          background:
            'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5))',
          color: 'white',
          transition: 'opacity 0.3s ease-in-out',
          ':focus-visible': {
            outline: '1px solid',
            outlineColor: 'primary.main',
            outlineOffset: '-1px',
          },
          display: {
            xs: 'unset',
            sm: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: 'center',
          }}
        >
          <ExpandMoreIcon />
        </Box>
      </ButtonBase>
      <ButtonBase
        aria-hidden={isXs && open ? 'false' : 'true'}
        aria-label={isXs && open ? '收起标签列表' : undefined}
        inert={!open}
        onClick={() => setOpen(!open)}
        sx={{
          textAlign: 'center',
          cursor: 'pointer',
          width: '100%',
          opacity: open ? 1 : 0,
          borderRadius: '4px',
          ':focus-visible': {
            outline: '1px solid',
            outlineColor: 'primary.main',
          },
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
          display: {
            xs: 'unset',
            sm: 'none',
          },
        }}
      >
        <ExpandLessIcon />
      </ButtonBase>
    </Box>
  )
}
