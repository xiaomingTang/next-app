import { FFmpegRoot } from './components/FFmpegRoot'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '在线 ffmpeg',
  description:
    '在线 ffmpeg，支持视频转码、视频剪辑、视频合并、视频压缩、视频裁剪、视频截图、视频加水印、视频添加字幕等功能。',
  keywords:
    'ffmpeg,online ffmpeg,在线 ffmpeg,前端 ffmpeg,浏览器 ffmpeg,ffmpeg 视频转换,ffmpeg 视频剪辑,ffmpeg 视频合并,ffmpeg 视频压缩,ffmpeg 视频裁剪,ffmpeg 视频截图,ffmpeg 视频加水印,ffmpeg 视频添加字幕',
})

export default async function Index() {
  return <FFmpegRoot />
}
