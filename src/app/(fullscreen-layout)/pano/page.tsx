import { PanoIndex } from './components/Pano'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '全景看看',
})

export default function Index() {
  return <PanoIndex />
}
