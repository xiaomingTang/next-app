'use client'

import { getUsers } from './server'
import { editUser } from './EditUser'

import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { useUser } from '@/user'

import { Controller, useForm } from 'react-hook-form'
import { Stack, TextField } from '@mui/material'
import { toast } from 'react-hot-toast'
import { useEffect, useMemo, useState } from 'react'
import { AddOutlined, SearchOutlined } from '@mui/icons-material'

import type { User } from '@prisma/client'

interface SearchProps {
  /**
   * 模糊搜索
   */
  name: string
  /**
   * 模糊搜索
   */
  email: string
}

export function useUserEditorSearchBar() {
  const { handleSubmit, control } = useForm<SearchProps>({
    defaultValues: {
      name: '',
      email: '',
    },
  })
  const { loading: searchLoading, withLoading: withSearchLoading } =
    useLoading()
  const [users, setUsers] = useState<User[]>([])
  const user = useUser()

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        withSearchLoading(
          cat(async (e) => {
            await getUsers({
              ...(e.name
                ? {
                    name: {
                      contains: e.name,
                    },
                  }
                : {}),
              ...(e.email
                ? {
                    email: {
                      contains: e.email,
                    },
                  }
                : {}),
            })
              .then(SA.decode)
              .then((res) => {
                setUsers(res)
                if (res.length === 0) {
                  toast.error('暂无数据')
                }
              })
          })
        )
      ),
    [handleSubmit, withSearchLoading]
  )

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  const elem = (
    <>
      <form onSubmit={onSubmit}>
        <Stack
          spacing={1}
          direction='row'
          sx={{
            p: 2,
            borderRadius: 1,
            marginBottom: 2,
            background: (theme) => theme.palette.background.paper,
          }}
        >
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
                label='用户名【支持模糊搜索】'
                helperText={error?.message ?? ' '}
                error={!!error}
                sx={{ minWidth: 200, maxWidth: 500 }}
              />
            )}
            rules={{
              maxLength: {
                value: 100,
                message: '最多 100 个字',
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
                label='邮箱【支持模糊搜索】'
                helperText={error?.message ?? ' '}
                error={!!error}
                sx={{ minWidth: 200, maxWidth: 500 }}
              />
            )}
            rules={{
              maxLength: {
                value: 100,
                message: '最多 100 个字',
              },
            }}
          />
          <CustomLoadingButton
            loading={searchLoading}
            variant='contained'
            type='submit'
            sx={{
              height: '40px',
              whiteSpace: 'nowrap',
            }}
            startIcon={<SearchOutlined />}
          >
            搜索
          </CustomLoadingButton>
          <CustomLoadingButton
            variant='outlined'
            sx={{
              height: '40px',
              whiteSpace: 'nowrap',
            }}
            startIcon={<AddOutlined />}
            onClick={cat(async () => {
              await editUser()
              await onSubmit()
            })}
          >
            新建
          </CustomLoadingButton>
        </Stack>
      </form>
    </>
  )

  return {
    elem,
    data: users,
    search: onSubmit,
  }
}