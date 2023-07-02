import { getShortUrl } from './server'

import { Error } from '@/components/Error'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'
import { seo } from '@/utils/seo'

import { redirect } from 'next/navigation'

interface Props {
  params: { hash: string }
}

export const metadata = seo.defaults({
  title: '短链服务',
})

export default async function Index({ params: { hash } }: Props) {
  const { data, error } = await getShortUrl({
    hash,
  })
  if (error) {
    return (
      <DefaultLayout>
        <DefaultBodyContainer>
          <Error {...error} />
        </DefaultBodyContainer>
      </DefaultLayout>
    )
  }
  return redirect(data.url)
}
