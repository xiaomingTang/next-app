import { withStatic } from '@/utils/withStatic'

import { create } from 'zustand'

const useRawLyricsViewer = create(() => ({
  visible: false,
}))

export const useLyricsViewer = withStatic(useRawLyricsViewer, {
  toggleVisible() {
    useRawLyricsViewer.setState((prev) => ({
      visible: !prev.visible,
    }))
  },
})
