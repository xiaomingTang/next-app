import { UrlRequirePassword } from './UrlRequirePassword'

import { AlertError } from '@/components/Error'
import { seo } from '@/utils/seo'
import { getShortUrl } from '@ADMIN/shortUrl/server'

import { redirect } from 'next/navigation'

interface Params {
  hash: string
}

interface Props {
  params: Promise<Params>
}

export const revalidate = 0

export const metadata = seo.defaults({
  title: '短链服务',
})

export default async function Index(props: Props) {
  const params = await props.params

  const { hash } = params

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
    return error.code === 428 ? (
      <UrlRequirePassword hash={hash} />
    ) : (
      <AlertError {...error} />
    )
  }

  return redirect(data.url)
}
