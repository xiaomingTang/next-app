'use client'

import { useList } from './useList'
import { panoConfig } from './pano-config'
import { PanoBox } from './PanoBox'
import { PanoPanel } from './PanoPanel'
import { Hotspot } from './Hotspot'
import { PanoEditor } from './PanoEditor'

import { PanoControls } from '@/components/PanoControls'
import { EPS } from '@/components/PanoControls/utils'

import { Canvas } from '@react-three/fiber'
import { clamp } from 'lodash-es'

function Scene() {
  const [_activePosIdx, activePos, setActivePosIdx] = useList(
    panoConfig.positions
  )
  const [_activeDecIdx, activeDec, setActiveDecIdx] = useList(
    activePos.decorations
  )
  const [_activePattIdx, activePatt, setActivePattIdx] = useList(
    activeDec.patterns
  )

  return (
    <>
      <PanoBox
        key={activePos.base.standard}
        src={activePos.base.standard}
        isActive
        radius={2}
      />
      <PanoBox
        key={activePatt.standard}
        src={activePatt.standard}
        isActive
        radius={1.9}
      />
      <PanoControls
        initialState={activePos.view}
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
      {activePos.hotspots.length > 0 &&
        activePos.hotspots.map((hotspot, hi) => (
          <Hotspot
            key={`${hotspot.name}-${hotspot.type}`}
            hotspot={hotspot}
            onClick={() => {
              if (hotspot.type === 'POSITION') {
                const nextIdx = panoConfig.positions.findIndex(
                  (item) => item.id === hotspot.target
                )
                setActivePosIdx(nextIdx)
              }
              if (hotspot.type === 'DECORATION') {
                const nextIdx = activePos.decorations.findIndex(
                  (item) => item.id === hotspot.target
                )
                setActiveDecIdx(nextIdx)
              }
            }}
          />
        ))}
    </>
  )
}

export function Pano() {
  return (
    <Canvas
      linear
      camera={{
        position: [0, 0, 0],
      }}
    >
      <Scene />
      <PanoPanel />
      <PanoEditor />
    </Canvas>
  )
}
