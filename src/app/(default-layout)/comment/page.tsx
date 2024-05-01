import { CommentArea } from './components/CommentArea'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '向站长留言',
})

export default async function Index() {
  return <CommentArea />
}
