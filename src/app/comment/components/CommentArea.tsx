'use client'

import { saveComment } from '../server'

import Anchor from '@/components/Anchor'
import { cat } from '@/errors/catchAndToast'
import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'

import { Alert, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { LoadingButton } from '@mui/lab'

type SaveCommentProps = Parameters<typeof saveComment>[0]

export function CommentArea() {
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control } = useForm<SaveCommentProps>()

  return (
    <>
      <Alert severity='warning' sx={{ mb: 2 }}>
        不要在此处提交友链申请, 申请友链请
        <Anchor href='/links'>前往友链页面</Anchor>
      </Alert>
      <form
        onSubmit={handleSubmit(
          cat(
            withLoading(async (e) => {
              await saveComment(e).then(SA.decode)
              toast.success('留言成功')
            })
          )
        )}
      >
        <Controller
          name='content'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              autoFocus
              label='留言内容'
              multiline
              size='small'
              sx={{ width: '100%' }}
              helperText={error?.message ?? ' '}
              error={!!error}
              inputProps={{
                style: {
                  overflow: 'auto',
                  height: '14em',
                },
              }}
            />
          )}
          rules={{
            required: {
              value: true,
              message: '必填项',
            },
            minLength: {
              value: 2,
              message: '多写一点吧',
            },
            maxLength: {
              value: 10000,
              message: '最多 10000 个字',
            },
          }}
        />
        <Controller
          name='email'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              size='small'
              sx={{ width: '100%' }}
              label='邮箱 (可选)'
              placeholder='留下邮箱, 我才能回复你'
              helperText={error?.message ?? ' '}
              error={!!error}
            />
          )}
          rules={{
            maxLength: {
              value: 200,
              message: '最多 200 个字符',
            },
            pattern: {
              value: /^\S+@\S+$/i,
              message: '无效邮箱',
            },
          }}
        />
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              size='small'
              sx={{ width: '100%' }}
              label='怎么称呼你呢 (可选)'
              helperText={error?.message ?? ' '}
              error={!!error}
            />
          )}
          rules={{
            maxLength: {
              value: 200,
              message: '最多 200 个字符',
            },
          }}
        />
        <LoadingButton
          loading={loading}
          variant='contained'
          type='submit'
          sx={{ width: '100%' }}
        >
          提交
        </LoadingButton>
      </form>
    </>
  )
}
