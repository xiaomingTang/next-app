'use client'

import { type TtsTaskItem } from '../../server'

import { create } from 'zustand'

export const useTtsTask = create(() => ({
  task: null as TtsTaskItem | null,
}))
