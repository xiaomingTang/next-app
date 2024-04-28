import { ImageWithState } from '@/components/ImageWithState'

import { Stack, Typography } from '@mui/material'
import { Html } from '@react-three/drei'

import type { Pano } from './pano-config'

const iconMap: Record<Pano.Hotspot['type'], string> = {
  POSITION: '/static/pano/preset/hotspot-position.png',
  DECORATION: '/static/pano/preset/hotspot-decoration.png',
}

export function Hotspot({
  hotspot,
  onClick,
}: {
  hotspot: Pano.Hotspot
  editable?: boolean
  onClick?: () => void | Promise<void>
}) {
  const y = Math.cos((hotspot.view.v / 180) * Math.PI)
  const x = Math.sin((hotspot.view.h / 180) * Math.PI)
  const z = Math.cos((hotspot.view.h / 180) * Math.PI)
  return (
    <Html
      transform
      sprite
      distanceFactor={1}
      position={[x, y, z]}
      style={{ userSelect: 'none', textAlign: 'center' }}
    >
      <Stack
        direction='column'
        alignItems='center'
        onClick={onClick}
        sx={{
          pb: 1,
          backgroundColor: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(8px)',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          [`&:hover`]: {
            backgroundColor: 'rgba(0,0,0,0.3)',
          },
          [`&:active`]: {
            backgroundColor: 'rgba(0,0,0,0.25)',
          },
        }}
      >
        <ImageWithState
          src={iconMap[hotspot.type]}
          width={65}
          height={65}
          style={{ width: '65px', height: '65px', pointerEvents: 'none' }}
        />
        <Typography sx={{ pointerEvents: 'none', fontSize: '14px' }}>
          {hotspot.name}
        </Typography>
      </Stack>
    </Html>
  )
}
