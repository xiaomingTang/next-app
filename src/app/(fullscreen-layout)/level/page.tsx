import { LevelWrapper } from './components/Wrapper'
import { LevelBall } from './components/Ball'

import { seo } from '@/utils/seo'

export const metadata = seo.defaults({
  title: '在线水平仪',
  description: '在线水平仪，水准仪',
  keywords: '在线,水平仪,水准仪,陀螺仪,检测水平度',
})

export default async function Home() {
  return (
    <LevelWrapper>
      <LevelBall />
    </LevelWrapper>
  )
}
