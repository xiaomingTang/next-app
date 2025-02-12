import { LyricsEditorPage } from './components/LyricsEditorPage'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '歌词编辑器',
  keywords:
    '歌词,歌词编辑器,lrc,lyric,lyrics,lyrics editor,拖拽编辑,波形图,音频,可视化,可视化编辑',
})

export default function Index() {
  return <LyricsEditorPage />
}
