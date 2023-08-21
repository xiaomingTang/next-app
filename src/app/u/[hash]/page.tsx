import { UrlRequirePassword } from './UrlRequirePassword'

import { getShortUrl } from '@/app/admin/shortUrl/server'
import { AlertError } from '@/components/Error'
import { DefaultBodyContainer } from '@/layout/DefaultBodyContainer'
import DefaultLayout from '@/layout/DefaultLayout'
import { seo } from '@/utils/seo'

import { redirect } from 'next/navigation'

interface Props {
  params: { hash: string }
}

export const revalidate = 0

export const metadata = seo.defaults({
  title: '短链服务',
})

export default async function Index({ params: { hash } }: Props) {
  const { data, error } = await getShortUrl({
    hash,
    limit: {
      gt: 0,
    },
    timeout: {
      gt: new Date(),
    },
  })

  if (error) {
    return (
      <DefaultLayout>
        <DefaultBodyContainer>
          {error.code === 428 ? (
            <UrlRequirePassword hash={hash} />
          ) : (
            <AlertError {...error} />
          )}
        </DefaultBodyContainer>
      </DefaultLayout>
    )
  }

  return redirect(data.url)
}
