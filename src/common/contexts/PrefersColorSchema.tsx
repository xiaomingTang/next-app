'use client'

/**
 * 服务端默认 dark, 客户端默认 light;
 *
 * 因为 ssg 没法处理客户端才有的 theme,
 * (必然会出现闪屏, 只有 ssr 才能处理);
 * 所以让服务端默认 dark, 客户端默认 light,
 * 从黑到白更自然一些(没那么突兀);
 */

import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'
import { useEffect } from 'react'

import type { PaletteMode } from '@mui/material'

const PREFERS_COLOR_SCHEMA = 'prefers-color-schema'

export function getPrefersColorSchema(): PaletteMode {
  if (typeof window === 'undefined') {
    return 'light'
  }
  const mode = localStorage.getItem(PREFERS_COLOR_SCHEMA)
  switch (mode) {
    case 'dark':
      return mode
    case 'light':
      return mode
    default:
      break
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const useRawPrefersColorSchema = create<{
  mode: PaletteMode
}>(() => ({
  mode: 'dark',
}))

export const usePrefersColorSchema = withStatic(useRawPrefersColorSchema, {
  init() {
    const mode = getPrefersColorSchema()
    document.documentElement.setAttribute('data-theme', mode)
    useRawPrefersColorSchema.setState({
      mode,
    })
  },
  toggle(newMode?: PaletteMode) {
    if (typeof window === 'undefined') {
      return
    }
    document.body.style.transition = 'color 0.5s, background-color 0.5s;'
    const curMode = getPrefersColorSchema()
    let nextMode: PaletteMode
    if (typeof newMode === 'undefined') {
      nextMode = curMode === 'dark' ? 'light' : 'dark'
    } else {
      nextMode = newMode
    }
    localStorage.setItem(PREFERS_COLOR_SCHEMA, nextMode)
    document.documentElement.setAttribute('data-theme', nextMode)
    useRawPrefersColorSchema.setState({
      mode: nextMode,
    })
  },
})

export function InitPrefersColorSchema() {
  useEffect(() => {
    usePrefersColorSchema.init()
  }, [])

  return <></>
}
