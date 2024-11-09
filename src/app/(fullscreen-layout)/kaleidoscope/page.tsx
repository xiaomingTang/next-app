import { Kaleidoscope } from './components/Kaleidoscope'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '妙笔生万花筒',
})

export default function Index() {
  return <Kaleidoscope />
}
