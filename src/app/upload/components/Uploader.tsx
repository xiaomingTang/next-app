'use client'

import { upload } from '../server'

import { useLoading } from '@/hooks/useLoading'

import { LoadingButton } from '@mui/lab'

export function Uploader() {
  const { loading, withLoading } = useLoading()
  return (
    <form
      onSubmit={withLoading(async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const res = await upload(formData)
        console.log(res)
      })}
    >
      <input type='file' name='files' multiple />
      <input name='name' />
      <LoadingButton variant='contained' type='submit' loading={loading}>
        提交
      </LoadingButton>
    </form>
  )
}
