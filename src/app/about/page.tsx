import { AboutMe } from './components/AboutMe'

import DefaultLayout from '@/layout/DefaultLayout'
import { seo } from '@/utils/seo'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'

export const metadata = seo.defaults({
  title: '关于我',
})

export default async function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <AboutMe />
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
