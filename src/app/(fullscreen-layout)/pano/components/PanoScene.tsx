import { PanoBox } from './PanoBox'
import { PanoHotspot } from './PanoHotspot'
import { usePanoStore } from './store'

import { PanoControls } from '@/app/(fullscreen-layout)/pano/components/PanoControls'
import { EPS } from '@/app/(fullscreen-layout)/pano/components/PanoControls/utils'

import { clamp } from 'lodash-es'
import { Suspense } from 'react'
import { Html } from '@react-three/drei'
import { CircularProgress } from '@mui/material'

const canvasLoading = (
  <Html>
    <CircularProgress
      color='primary'
      size='24px'
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
      }}
    />
  </Html>
)

export function PanoScene({ editable }: { editable?: boolean }) {
  const { curPos } = usePanoStore()

  return (
    <>
      <Suspense fallback={canvasLoading}>
        <PanoBox
          key={curPos.base.standard}
          src={curPos.base.standard}
          isActive
          radius={2}
        />
      </Suspense>
      {usePanoStore.getCurDecPatterns().map((item) => (
        <Suspense fallback={canvasLoading} key={item.pattern.standard}>
          <PanoBox src={item.pattern.standard} isActive radius={1.9} />
        </Suspense>
      ))}
      {curPos.hotspots.length > 0 &&
        curPos.hotspots.map((hotspot) => (
          <PanoHotspot
            key={`${curPos.name}-${hotspot.name}-${hotspot.type}-${hotspot.target}`}
            hotspot={hotspot}
            editable={editable}
          />
        ))}
      <PanoControls
        initialState={curPos.view}
        onRotate={(nextState, prevState) => {
          const deltaH = nextState.h - prevState.h
          const deltaV = nextState.v - prevState.v
          return {
            ...nextState,
            h: prevState.h + 2 * deltaH,
            v: clamp(prevState.v + 1.5 * deltaV, EPS, 180 - EPS),
          }
        }}
        onZoom={(state) => ({
          ...state,
          fov: clamp(state.fov, 30, 120),
        })}
      />
    </>
  )
}
