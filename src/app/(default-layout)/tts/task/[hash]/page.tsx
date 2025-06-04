import ViewTtsTaskPage from '../../components/ViewTtsTaskPage'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '语音合成任务详情',
  keywords: 'tts,语音合成,文字转语音,文本转语音',
})

export default function Page() {
  /*
   * 渲染TTS任务详情页面
   */
  return <ViewTtsTaskPage />
}
