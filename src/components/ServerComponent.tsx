'use server'

import type { AnyObj, Or } from '@zimi/type-utils'
import type { PlainError, ServerResponse } from '@/errors/utils'

interface ServerComponentProps<T> {
  api: () => Promise<ServerResponse<T>>
  render: (value: T) => React.ReactNode | React.ReactNode[]
  errorBoundary: (error: PlainError) => React.ReactNode | React.ReactNode[]
}

export type LoadingAble<T extends AnyObj> = Or<
  T,
  {
    loading: true
    /**
     * 1 - 10
     */
    size: number
  }
>

export async function ServerComponent<T>({
  api,
  render,
  errorBoundary,
}: ServerComponentProps<T>) {
  const res = await api()
  return (
    <>
      {res?.data && render(res.data)}
      {res?.error && errorBoundary(res.error)}
    </>
  )
}
