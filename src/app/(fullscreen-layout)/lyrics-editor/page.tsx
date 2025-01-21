import { LyricsEditorPage } from './components/LyricsEditorPage'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '歌词编辑器',
  keywords: '歌词,歌词编辑器,lrc,lyric,lyrics,lyrics editor',
})

export default function Index() {
  return <LyricsEditorPage />
}
