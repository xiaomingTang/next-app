import { cat } from '@/errors/catchAndToast'
import {
  getWindowOrientation,
  useWindowOrientation,
} from '@/hooks/useWindowSize'
import {
  fullScreenEnabled,
  toggleFullScreen,
  useFullScreen,
  useRawPlatform,
} from '@/utils/device'
import { dark } from '@/utils/theme'

import {
  Box,
  Button,
  IconButton,
  Slide,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'

const requestFullscreenLandscape = cat(async () => {
  await toggleFullScreen(document.documentElement, true)
  if (getWindowOrientation() === 'landscape') {
    return
  }
  try {
    await window.screen.orientation.lock('landscape')
  } catch (_) {
    throw new Error('不支持自动横屏，建议横屏浏览，体验更佳')
  }
})

function MobileFullscreenLandscapeToggle() {
  const platform = useRawPlatform()
  const isLandscape = useWindowOrientation() === 'landscape'
  const { isFullScreen } = useFullScreen()

  if (platform !== 'mobile' || !fullScreenEnabled) {
    return <></>
  }

  if (isLandscape && isFullScreen) {
    return (
      <IconButton
        sx={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
        }}
        onClick={cat(() => toggleFullScreen(null, false))}
      >
        <FullscreenExitIcon />
      </IconButton>
    )
  }

  return (
    <IconButton
      sx={{
        position: 'absolute',
        bottom: '8px',
        right: '8px',
      }}
      onClick={requestFullscreenLandscape}
    >
      <FullscreenIcon />
    </IconButton>
  )
}

export function PreferFullscreenLandscape({
  enabled = true,
  trigger = true,
}: {
  enabled?: boolean
  trigger?: boolean
}) {
  const theme = useTheme()
  const { isFullScreen } = useFullScreen()
  const platform = useRawPlatform()
  const isLandscape = useWindowOrientation() === 'landscape'
  const [closed, setClosed] = useState(false)
  const modalVisible = !closed && !(isLandscape && isFullScreen)

  useEffect(() => {
    if (enabled) {
      setClosed(false)
    }
  }, [enabled])

  if (!enabled || platform !== 'mobile' || !fullScreenEnabled) {
    return <></>
  }

  return (
    <>
      <Slide direction='up' in={modalVisible} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: '8px',
            right: '8px',
            padding: 1,
            zIndex: theme.zIndex.snackbar,
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            backdropFilter: 'blur(4px)',
            borderRadius: 1,
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            [dark()]: {
              background: 'rgba(255, 255, 255, 0.5)',
              color: 'black',
            },
          }}
        >
          <Typography>
            {fullScreenEnabled && isLandscape ? '全屏体验更佳' : '横屏体验更佳'}
          </Typography>
          <Button
            size='small'
            variant='contained'
            color='warning'
            sx={{ ml: 1, minWidth: 0 }}
            onClick={() => {
              setClosed(true)
            }}
          >
            不用
          </Button>
          <Button
            size='small'
            variant='contained'
            color='primary'
            sx={{ ml: 1, minWidth: 0 }}
            onClick={() => {
              void requestFullscreenLandscape()
              setClosed(true)
            }}
          >
            立即切换
          </Button>
        </Box>
      </Slide>
      {trigger && !modalVisible && <MobileFullscreenLandscapeToggle />}
    </>
  )
}
