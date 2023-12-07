'use client'

import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { getShortUrl } from '@ADMIN/shortUrl/server'

import { LoadingButton } from '@mui/lab'
import { Alert, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

export function UrlRequirePassword({ hash }: { hash: string }) {
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control, setError } = useForm<{ password: string }>()

  return (
    <form
      onSubmit={handleSubmit(
        withLoading(async (e) => {
          await getShortUrl(
            {
              hash,
              limit: {
                gt: 0,
              },
              timeout: {
                gt: new Date(),
              },
            },
            e.password
          )
            .then(SA.decode)
            .then((res) => {
              window.location.replace(res.url)
            })
            .catch((err) => {
              setError('password', {
                message: err.message,
              })
            })
        })
      )}
    >
      <Alert severity='warning' sx={{ mb: 2 }}>
        你需要密码才能访问该链接
      </Alert>
      <Controller
        name='password'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            autoFocus
            label='密码'
            helperText={error?.message ?? ' '}
            error={!!error}
          />
        )}
        rules={{
          required: {
            value: true,
            message: '必填项',
          },
          minLength: {
            value: 3,
            message: '3 - 24 位',
          },
          maxLength: {
            value: 24,
            message: '3 - 24 位',
          },
        }}
      />
      <br />
      <LoadingButton loading={loading} variant='contained' type='submit'>
        提交
      </LoadingButton>
    </form>
  )
}
