import { usePeer } from '../../store/usePeer'
import { useMediaConnectionState } from '../../hooks/usePeerState'

import { StreamVideo } from '@/app/(default-layout)/blog/components/StreamVideo'
import { assertNever } from '@/utils/function'

import { Box } from '@mui/material'
import { useMemo, useState } from 'react'

import type { SxProps, Theme } from '@mui/material'

type Size = 'none' | 'small' | 'medium' | 'large' | 'full'

function geneSx(size: Size): SxProps<Theme> {
  const commonSx: SxProps<Theme> = {
    position: 'absolute',
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
  const { activeConnectionInfo } = usePeer()
  const connection = activeConnectionInfo?.mc ?? null
  const state = useMediaConnectionState(connection)
  const [size, setSize] = useState<Size>('full')

  const containerSx: SxProps<Theme> = useMemo(() => {
    if (state !== 'connected') {
      return geneSx('none')
    }
    if (size === 'full') {
      return geneSx('full')
    }
    return geneSx('small')
  }, [size, state])

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
          fit='contain'
          muted={false}
          mediaStream={connection?.remoteStream}
        />
        {size === 'full' && (
          <Box sx={geneSx('small')}>
            <StreamVideo
              mirror
              fit='contain'
              muted={false}
              mediaStream={connection?.localStream}
            />
          </Box>
        )}
      </Box>
      {size !== 'full' && state === 'connected' && (
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
