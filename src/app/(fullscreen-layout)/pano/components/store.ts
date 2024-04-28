import { panoConfig } from './constants'

import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { TextureLoader } from 'three'

import type { Pano } from './type'

const useRawPanoStore = create(
  immer(() => ({
    pano: panoConfig,
    curPos: panoConfig.positions[0],
    curDec: null as Pano.Decoration | null | undefined,
    enabledDecs: {} as Record<string, string>,
  }))
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
      const prevDecName = state.curDec?.name
      state.curDec =
        nextPos.decorations.find((item) => item.name === prevDecName) ?? null
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
