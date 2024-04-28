import { useList } from './useList'
import { panoConfig } from './pano-config'
import { PanoBox } from './PanoBox'
import { Hotspot } from './Hotspot'

import { PanoControls } from '@/components/PanoControls'
import { EPS } from '@/components/PanoControls/utils'

import { clamp } from 'lodash-es'
import toast from 'react-hot-toast'

export function PanoScene() {
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
      {activePos.hotspots.length > 0 &&
        activePos.hotspots.map((hotspot) => (
          <Hotspot
            key={`${activePos.id}-${hotspot.name}-${hotspot.type}-${hotspot.target}`}
            hotspot={hotspot}
            onClick={() => {
              if (hotspot.type === 'POSITION') {
                const nextIdx = panoConfig.positions.findIndex(
                  (item) => item.id === hotspot.target
                )
                if (nextIdx < 0) {
                  toast.error(`${hotspot.name} 不存在`)
                  return
                }
                setActivePosIdx(nextIdx)
              }
              if (hotspot.type === 'DECORATION') {
                const nextIdx = activePos.decorations.findIndex(
                  (item) => item.id === hotspot.target
                )
                if (nextIdx < 0) {
                  toast.error(`${hotspot.name} 不存在`)
                  return
                }
                setActiveDecIdx(nextIdx)
              }
            }}
          />
        ))}
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
    </>
  )
}
