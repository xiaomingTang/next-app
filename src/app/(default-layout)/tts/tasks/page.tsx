import ListTtsTaskPage from './ListTtsTaskPage'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '语音合成任务列表',
  keywords: 'tts,语音合成,文字转语音,文本转语音',
})

export default function Page() {
  /*
   * 渲染TTS任务列表页面
   */
  return <ListTtsTaskPage />
}
