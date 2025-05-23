import { usePeer } from '../../store'

import { StreamVideo } from '@D/blog/components/StreamVideo'
import { assertNever } from '@/utils/function'
import { useListen } from '@/hooks/useListen'

import { Box } from '@mui/material'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import type { SxProps, Theme } from '@mui/material'

type Size = 'none' | 'small' | 'medium' | 'large' | 'full'

function geneSx(size: Size): SxProps<Theme> {
  const commonSx: SxProps<Theme> = {
    position: 'absolute',
    zIndex: 1,
    transition: 'all .5s',
  }

  let sx: SxProps<Theme>

  switch (size) {
    case 'none':
      sx = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      }
      break
    case 'small':
      sx = {
        left: '8px',
        top: '8px',
        width: '100px',
        height: '150px',
      }
      break
    case 'medium':
      sx = {
        left: '8px',
        top: '8px',
        width: '200px',
        height: '300px',
      }
      break
    case 'large':
      sx = {
        left: '8px',
        top: '8px',
        width: '300px',
        height: '450px',
      }
      break
    case 'full':
      sx = {
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }
      break
    default:
      assertNever(size)
      return commonSx
  }

  return {
    ...commonSx,
    ...sx,
  }
}

export function VideoCallElem() {
  const member = usePeer.useActiveMember()
  const connection = member?.mc || null
  const status = member?.mcStatus || null
  const [size, setSize] = useState<Size>('full')

  useListen(status, (next, prev) => {
    if (prev === 'connected' && next === 'disconnected') {
      toast('视频已断开')
    }
  })

  const containerSx: SxProps<Theme> = useMemo(() => {
    if (status !== 'connected') {
      return geneSx('none')
    }
    if (size === 'full') {
      return geneSx('full')
    }
    return geneSx('small')
  }, [size, status])

  return (
    <>
      <Box
        sx={containerSx}
        onClick={() => {
          setSize((prev) => (prev === 'full' ? 'small' : 'full'))
        }}
      >
        <StreamVideo
          mirror
          // should updates when remoteStream state updated and/or size changed
          key={`${status}-${size}`}
          fit='contain'
          muted={false}
          mediaStream={connection?.remoteStream}
        />
        <Box
          sx={geneSx(
            size === 'full' && status === 'connected' ? 'small' : 'none'
          )}
        >
          <StreamVideo
            // should updates when remoteStream state updated and/or size changed
            key={`${status}-${size}`}
            mirror
            fit='contain'
            muted
            mediaStream={connection?.localStream}
          />
        </Box>
      </Box>
      {size !== 'full' && status === 'connected' && (
        <Box
          sx={{
            ...geneSx('small'),
            position: 'relative',
          }}
          onClick={() => {
            setSize((prev) => (prev === 'full' ? 'small' : 'full'))
          }}
        />
      )}
    </>
  )
}
