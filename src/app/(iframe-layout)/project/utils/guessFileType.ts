import type { ProjectType } from '@prisma/client'

export function guessFileType(name: string): ProjectType {
  const ext = name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'png':
    case 'jpeg':
    case 'jpg':
    case 'gif':
    case 'svg':
    case 'bmp':
    case 'tiff':
    case 'ico':
    case 'webp':
      return 'IMAGE'
    case 'mp4':
    case 'webm':
    case 'flv':
    case 'avi':
    case 'mov':
      return 'VIDEO'
    case 'mp3':
    case 'ogg':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'wma':
      return 'AUDIO'
    default:
      return 'UNKNOWN'
  }
}
