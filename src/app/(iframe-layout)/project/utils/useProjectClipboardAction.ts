import { create } from 'zustand'
import { withStatic } from '@zimi/utils'

import type { ProjectType } from '@/generated-prisma-client'

interface ProjectClipboardData {
  type: ProjectType
  hash: string
}

const useRawProjectClipboardAction = create(() => ({
  action: 'COPY' as 'COPY' | 'CUT',
  data: null as null | ProjectClipboardData,
}))

export const useProjectClipboardAction = withStatic(
  useRawProjectClipboardAction,
  {
    cut(data: ProjectClipboardData) {
      useRawProjectClipboardAction.setState({ action: 'CUT', data })
    },
    copy(data: ProjectClipboardData) {
      useRawProjectClipboardAction.setState({ action: 'COPY', data })
    },
    clear() {
      useRawProjectClipboardAction.setState({ action: 'COPY', data: null })
    },
  }
)
