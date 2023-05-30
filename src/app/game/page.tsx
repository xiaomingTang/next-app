import { Comp } from '../ClientComp'

import DefaultLayout from '@/layout/DefaultLayout'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'

export default function Home() {
  return (
    <DefaultLayout>
      <DefaultBodyContainer>
        <Comp />
      </DefaultBodyContainer>
    </DefaultLayout>
  )
}
