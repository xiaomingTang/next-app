import { panoConfig } from './constants'

import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { TextureLoader } from 'three'

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
  getCurDecPatterns() {
    const { curPos, enabledDecs } = useRawPanoStore.getState()
    return curPos.decorations
      .map((dec) => {
        const patternName = enabledDecs[dec.name]
        if (!patternName) {
          // 后面有 filter Boolean, 此处 as never 是为了类型
          return null as never
        }
        const pat = dec.patterns.find((item) => item.name === patternName)
        if (!pat) {
          // 后面有 filter Boolean, 此处 as never 是为了类型
          return null as never
        }
        return {
          decoration: dec,
          pattern: pat,
        }
      })
      .filter(Boolean)
  },
})
