'use client'

import { editShortUrl } from './EditUrl'

import { getShortUrls } from '../server'

import { SA } from '@/errors/utils'
import { useLoading } from '@/hooks/useLoading'
import { cat } from '@/errors/catchAndToast'
import { CustomLoadingButton } from '@/components/CustomLoadingButton'
import { useUser } from '@/user'

import { Controller, useForm } from 'react-hook-form'
import { Stack, TextField } from '@mui/material'
import { toast } from 'react-hot-toast'
import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import { Role } from '@prisma/client'

import type { ShortUrlWithCreator } from '../server'

interface SearchProps {
  /**
   * 模糊搜索
   */
  url: string
  hash: string
}

export function useUrlEditorSearchBar() {
  const { handleSubmit, control } = useForm<SearchProps>({
    defaultValues: {
      url: '',
      hash: '',
    },
  })
  const [searchLoading, withSearchLoading] = useLoading()
  const [urls, setUrls] = useState<ShortUrlWithCreator[]>([])
  const user = useUser()

  const onSubmit = useMemo(
    () =>
      handleSubmit(
        withSearchLoading(
          cat(async (e) => {
            await getShortUrls({
              // admin 用户展示所有人的博客
              // 普通用户仅展示自己的博客
              creatorId: user.role === Role.ADMIN ? undefined : user.id,
              ...(e.hash
                ? {
                    hash: e.hash,
                  }
                : {}),
              ...(e.url
                ? {
                    url: {
                      contains: e.url,
                    },
                  }
                : {}),
            })
              .then(SA.decode)
              .then((res) => {
                setUrls(res)
                if (res.length === 0) {
                  toast.error('暂无数据')
                }
              })
          })
        )
      ),
    [handleSubmit, user.id, user.role, withSearchLoading]
  )

  useEffect(() => {
    onSubmit()
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
            background: (theme) => theme.palette.background.paper,
          }}
        >
          <Controller
            name='url'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
                label='链接【支持模糊搜索】'
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
            name='hash'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                size='small'
                label='hash'
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
              await editShortUrl()
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
    data: urls,
    search: onSubmit,
  }
}
