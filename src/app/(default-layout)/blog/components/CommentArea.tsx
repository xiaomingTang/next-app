'use client'

import { saveComment } from '../../comment/server'

import { cat } from '@/errors/catchAndToast'
import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'

import { Box, Stack, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { LoadingButton } from '@mui/lab'

import type { BlogWithTags } from '@/app/admin/blog/server'
import type { Control } from 'react-hook-form'

type SaveCommentProps = Parameters<typeof saveComment>[0]

function ContentController({
  control,
}: {
  control: Control<SaveCommentProps>
}) {
  return (
    <Controller
      name='content'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          label='欢迎留言讨论'
          placeholder='留言内容及联系信息仅站长可见'
          multiline
          sx={{ width: '100%' }}
          rows={6}
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
          value: 2,
          message: '多写一点吧',
        },
        maxLength: {
          value: 10000,
          message: '最多 10000 个字',
        },
      }}
    />
  )
}

function EmailController({ control }: { control: Control<SaveCommentProps> }) {
  return (
    <Controller
      name='email'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
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
  )
}

function NicknameController({
  control,
}: {
  control: Control<SaveCommentProps>
}) {
  return (
    <Controller
      name='name'
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
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
  )
}

export function CommentArea({ blog }: { blog: BlogWithTags }) {
  const [loading, withLoading] = useLoading()
  const { handleSubmit, control } = useForm<SaveCommentProps>()

  return (
    <form
      onSubmit={handleSubmit(
        cat(
          withLoading(async (e) => {
            await saveComment({
              ...e,
              content: `留言来自博客《${blog.title}》\nhash《${blog.hash}》\n内容为：\n${e.content}`,
            }).then(SA.decode)
            toast.success('留言成功')
          })
        )
      )}
    >
      <ContentController control={control} />
      <Stack columnGap={2} direction='row' useFlexGap flexWrap='wrap'>
        <Box width={{ xs: '100%', sm: '36%', md: '30%' }}>
          <EmailController control={control} />
        </Box>
        <Box width={{ xs: '100%', sm: '36%', md: '30%' }}>
          <NicknameController control={control} />
        </Box>
      </Stack>
      <LoadingButton
        loading={loading}
        variant='contained'
        type='submit'
        sx={{ width: { xs: '100%', sm: '36%', md: '30%' } }}
      >
        提交
      </LoadingButton>
    </form>
  )
}
