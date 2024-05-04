import { PanoBox } from './PanoBox'
import { PanoHotspot } from './PanoHotspot'
import { usePanoStore } from './store'

import { PanoControls } from '@/app/(fullscreen-layout)/pano/components/PanoControls'
import { EPS } from '@/app/(fullscreen-layout)/pano/components/PanoControls/utils'
import { STYLE } from '@/config'
import { dedup } from '@/utils/array'
import { usePreviousState } from '@/hooks/usePreviousState'

import { clamp } from 'lodash-es'
import { Suspense, useMemo } from 'react'
import { Html } from '@react-three/drei'
import { CircularProgress } from '@mui/material'

const canvasLoading = (
  <Html zIndexRange={[STYLE.zIndex.canvasHtml, 0]}>
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

export function PanoScene() {
  const { curPos } = usePanoStore()
  const curDecPatterns = usePanoStore.useCurDecPatterns()
  const images = useMemo(
    () => [curPos.base, ...curDecPatterns.map((item) => item.pattern)],
    [curDecPatterns, curPos.base]
  )
  const [prevImages, setPrevImages] = usePreviousState(images)
  const mergedImages = useMemo(
    () => dedup([...(prevImages ?? []), ...images], (item) => item.standard),
    [images, prevImages]
  )

  return (
    <>
      {mergedImages.map((item, i) => (
        <Suspense key={item.standard} fallback={canvasLoading}>
          <PanoBox
            src={item.standard}
            radius={100 - i * 0.1}
            onLoad={() => {
              setPrevImages((prev) =>
                (prev ?? []).filter(
                  (prevItem) => prevItem.standard === item.standard
                )
              )
            }}
          />
        </Suspense>
      ))}
      {curPos.hotspots.map((hotspot) => (
        <PanoHotspot
          key={`${curPos.name}-${hotspot.name}-${hotspot.type}-${hotspot.target}`}
          hotspot={hotspot}
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
