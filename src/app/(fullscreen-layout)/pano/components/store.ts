import { panoConfig } from './constants'

import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { useShallow } from 'zustand/shallow'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { TextureLoader } from 'three'
import { useMemo } from 'react'

import type { Pano } from './type'

const useRawPanoStore = create(
  subscribeWithSelector(
    immer(() => ({
      pano: panoConfig,
      curPos: panoConfig.positions[0],
      curDec: null as Pano.Decoration | null | undefined,
      enabledDecs: {} as Record<string, string>,
    }))
  )
)

useRawPanoStore.subscribe(
  (state) => state.pano,
  () => {
    useRawPanoStore.setState((state) => {
      const nextPos =
        state.pano.positions.find((item) => item.name === state.curPos.name) ??
        state.pano.positions[0]
      state.curPos = nextPos
    })
  }
)

useRawPanoStore.subscribe(
  (state) => state.curPos,
  (nextPos) => {
    useRawPanoStore.setState((state) => {
      const prevDecName = state.curDec?.name
      state.curDec =
        nextPos.decorations.find((item) => item.name === prevDecName) ?? null
    })
  }
)

export const usePanoStore = withStatic(useRawPanoStore, {
  async setCurPos(name: string) {
    const nextPos = useRawPanoStore
      .getState()
      .pano.positions.find((item) => item.name === name)
    if (!nextPos) {
      throw new Error(`目标位置不存在: ${name}`)
    }
    await new TextureLoader().loadAsync(nextPos.base.standard)
    useRawPanoStore.setState((state) => {
      state.curPos = nextPos
    })
  },
  setCurDec(name: string | null) {
    if (!name) {
      useRawPanoStore.setState({
        curDec: null,
      })
      return
    }
    const nextDec = useRawPanoStore
      .getState()
      .curPos.decorations.find((item) => item.name === name)
    if (!nextDec) {
      throw new Error(`目标装饰不存在: ${name}`)
    }
    if (nextDec.patterns.length === 0) {
      throw new Error(`目标装饰无内容: ${name}`)
    }
    useRawPanoStore.setState({
      curDec: nextDec,
    })
  },
  useCurDecPatterns() {
    const { curPos, enabledDecs } = useRawPanoStore(
      useShallow((state) => ({
        curPos: state.curPos,
        enabledDecs: state.enabledDecs,
      }))
    )
    return useMemo(
      () =>
        curPos.decorations
          .map((dec) => {
            const patternName = enabledDecs[dec.name]
            if (!patternName) {
              return null
            }
            const pat = dec.patterns.find((item) => item.name === patternName)
            if (!pat) {
              return null
            }
            return {
              decoration: dec,
              pattern: pat,
            }
          })
          .filter((s) => !!s),
      [curPos.decorations, enabledDecs]
    )
  },
})
