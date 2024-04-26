import { Pano } from './components/Pano'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '全景',
})

export default function Index() {
  return <Pano />
}
