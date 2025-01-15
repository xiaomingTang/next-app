import type { ProjectType } from '@prisma/client'

interface NetworkFileTypeInfo {
  label: string
  value: ProjectType
}

export const networkFileTypeInfos: NetworkFileTypeInfo[] = [
  {
    label: '图片',
    value: 'IMAGE',
  },
  {
    label: '视频',
    value: 'VIDEO',
  },
  {
    label: '音频',
    value: 'AUDIO',
  },
  {
    label: '其他',
    value: 'UNKNOWN',
  },
]
