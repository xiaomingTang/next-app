import { Clock } from '../components/Clock'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '在线时钟',
  description: '展示各种各样的时钟',
  keywords: '时钟,钟表,表,时间,表盘,表针,clock,dial',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Clock
      sx={{
        height: '100vh',
      }}
    >
      {children}
    </Clock>
  )
}
