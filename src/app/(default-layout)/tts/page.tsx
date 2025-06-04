import TtsTaskCreatePage from './components/CreateTtsTaskPage'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '新建语音合成任务',
  keywords: 'tts,语音合成,文字转语音,文本转语音',
})

export default function Page() {
  /*
   * 直接渲染TtsTaskCreatePage
   */
  return <TtsTaskCreatePage />
}
