'use client'

import { editUser } from './EditUser'

import { getUsers } from '../server'

import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'

import { Controller, useForm } from 'react-hook-form'
import { Stack, TextField } from '@mui/material'
import { toast } from 'react-hot-toast'
import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'

import type { User } from '@/generated-prisma-client'

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
  const [searchLoading, withSearchLoading] = useLoading()
  const [users, setUsers] = useState<User[]>([])

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
    void onSubmit()
  }, [onSubmit])

  const elem = (
    <>
      <form onSubmit={onSubmit}>
        <Stack
          useFlexGap
          flexWrap='wrap'
          spacing={1}
          direction='row'
          sx={{
            p: 2,
            borderRadius: 1,
            marginBottom: 2,
            background: 'background.paper',
            color: 'var(--custom-fg)',
          }}
        >
          <Controller
            name='name'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
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
            startIcon={<SearchIcon />}
          >
            搜索
          </CustomLoadingButton>
          <CustomLoadingButton
            variant='outlined'
            sx={{
              height: '40px',
              whiteSpace: 'nowrap',
            }}
            startIcon={<AddIcon />}
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
